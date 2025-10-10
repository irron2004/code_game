import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const buildDir = path.resolve(__dirname, 'algorithm-game');
const port = process.env.PORT || 8080;

app.use(express.json({ limit: '64kb' }));

const telemetryEnabled = process.env.ENABLE_TELEMETRY !== 'false';
const telemetryOrigins = (process.env.INGEST_ALLOW_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const telemetrySecret = process.env.INGEST_SECRET || null;
const requireAuth = telemetrySecret ? process.env.INGEST_REQUIRE_AUTH !== 'false' : false;
const telemetryTokenAudience = process.env.INGEST_AUDIENCE || 'ingest';
const telemetryTokenTTL = Number(process.env.INGEST_TOKEN_TTL_MS || 5 * 60 * 1000);
const ingestWindowMs = Number(process.env.INGEST_WINDOW_MS || 60_000);
const ingestMax = Number(process.env.INGEST_RATE_MAX || 600);

let pool = null;
const connectionString = process.env.DATABASE_URL || null;
if (telemetryEnabled && connectionString){
  pool = new pg.Pool({
    connectionString,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  });
  pool.on('error', (err) => {
    console.error('[telemetry] database error', err);
  });
} else if (telemetryEnabled){
  console.warn('[telemetry] DATABASE_URL missing; events will be accepted but not stored.');
}

function applyTelemetryCors(req, res){
  if (!telemetryOrigins.length) return;
  const origin = req.headers.origin;
  if (origin && telemetryOrigins.includes(origin)){
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
}

function verifyBearer(req){
  if (!requireAuth) return true;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  try {
    jwt.verify(header.slice(7), telemetrySecret, { audience: telemetryTokenAudience });
    return true;
  } catch (err){
    return false;
  }
}

if (telemetryEnabled){
  const limiter = rateLimit({
    windowMs: ingestWindowMs,
    max: ingestMax,
  });
  app.use(['/v1/events', '/v1/ingest-token'], limiter);

  app.options(['/v1/events', '/v1/ingest-token'], (req, res) => {
    applyTelemetryCors(req, res);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
  });

  app.get('/v1/ingest-token', (req, res) => {
    applyTelemetryCors(req, res);
    if (!telemetrySecret){
      res.status(501).json({ error: 'telemetry token service disabled' });
      return;
    }
    const payload = { aud: telemetryTokenAudience };
    const token = jwt.sign(payload, telemetrySecret, { expiresIn: Math.max(telemetryTokenTTL / 1000, 60) });
    res.json({ token });
  });

  app.post('/v1/events', async (req, res) => {
    applyTelemetryCors(req, res);
    if (!verifyBearer(req)){
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    const events = Array.isArray(req.body?.events) ? req.body.events : null;
    if (!events){
      res.status(400).json({ error: 'invalid payload' });
      return;
    }
    let stored = 0;
    if (pool){
      const client = await pool.connect();
      try {
        const query = `
          INSERT INTO events(event_id, ts, received_at, type, session_id, anon_id, app_version, env, page, lang, props)
          VALUES ($1, $2, now(), $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (event_id) DO NOTHING
        `;
        for (const event of events){
          if (!event?.event_id || !event?.type || !event?.ts) continue;
          const ts = new Date(Number(event.ts));
          if (Number.isNaN(ts.getTime())) continue;
          await client.query(query, [
            event.event_id,
            ts,
            event.type,
            event.session_id ?? null,
            event.anon_id ?? null,
            event.app?.version ?? null,
            event.app?.env ?? null,
            event.ctx?.page ?? null,
            event.ctx?.lang ?? null,
            event.props ?? {},
          ]);
          stored += 1;
        }
      } finally {
        client.release();
      }
    } else {
      if (process.env.NODE_ENV !== 'production'){
        console.info('[telemetry] accepted events (dry-run)', events.length);
      }
    }
    res.status(202).json({ accepted: true, received: events.length, stored });
  });
}

app.use(express.static(buildDir, {
  index: false,
  extensions: ['html'],
  maxAge: '1h',
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Algorithm Learning Game running on port ${port}`);
  if (telemetryEnabled){
    console.log('[telemetry] ingest endpoint enabled');
  }
});
