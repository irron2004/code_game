const DEFAULT_BATCH_MAX = 20;
const DEFAULT_BATCH_BYTES = 32 * 1024;
const DEFAULT_FLUSH_MS = 5000;
const IMMEDIATE_EVENTS = new Set(['algo_run_end', 'no_path_detected', 'tutorial_completed', 'error']);

function safeNow(){
  return Date.now();
}

function toMilliseconds(value){
  if (!value) return safeNow();
  if (typeof value === 'number') return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? safeNow() : parsed;
}

function randomId(){
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'){
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

function generateUlid(){
  const time = safeNow().toString(36).padStart(10, '0');
  return `${time}-${randomId()}`;
}

function safeStorage(storage, key, fallbackFactory){
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function'){
    return fallbackFactory();
  }
  const existing = storage.getItem(key);
  if (existing){
    return existing;
  }
  const value = fallbackFactory();
  try {
    storage.setItem(key, value);
  } catch (err){
    // Ignore quota/security errors, fall back to in-memory string.
  }
  return value;
}

function safeViewport(){
  if (typeof window === 'undefined') return { w: 0, h: 0 };
  return {
    w: window.innerWidth || 0,
    h: window.innerHeight || 0,
  };
}

function safeLanguage(){
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language || 'en';
}

function cloneProps(props){
  try {
    if (typeof structuredClone === 'function'){
      return structuredClone(props);
    }
  } catch (err){
    // ignore structuredClone failures
  }
  try {
    return JSON.parse(JSON.stringify(props ?? {}));
  } catch (err){
    return {};
  }
}

export class Telemetry {
  constructor({
    endpoint = '/v1/events',
    tokenEndpoint = null,
    appVersion = '0.0.0',
    env = 'dev',
    batchSize = DEFAULT_BATCH_MAX,
    batchBytes = DEFAULT_BATCH_BYTES,
    flushInterval = DEFAULT_FLUSH_MS,
  } = {}){
    this.endpoint = endpoint;
    this.tokenEndpoint = tokenEndpoint;
    this.app = { version: appVersion, env };
    this.batchSize = batchSize;
    this.batchBytes = batchBytes;
    this.flushInterval = flushInterval;
    this.queue = [];
    this.tokenCache = null;
    this.tokenExpiry = 0;

    const sessionSource = typeof sessionStorage !== 'undefined' ? sessionStorage : null;
    const localSource = typeof localStorage !== 'undefined' ? localStorage : null;
    this.sessionId = safeStorage(sessionSource, 'alg-game:sid', () => `s_${randomId()}`);
    this.anonId = safeStorage(localSource, 'alg-game:aid', () => `a_${randomId()}`);

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function'){
      this._visibilityHandler = () => {
        if (document?.visibilityState === 'hidden'){
          this.flush({ final: true }).catch(() => {});
        }
      };
      this._pageHideHandler = () => {
        this.flush({ final: true }).catch(() => {});
      };
      window.addEventListener('visibilitychange', this._visibilityHandler);
      window.addEventListener('pagehide', this._pageHideHandler);
    }

    this.timer = setInterval(() => {
      this.flush().catch(() => {});
    }, this.flushInterval);
  }

  destroy(){
    if (this.timer){
      clearInterval(this.timer);
      this.timer = null;
    }
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function'){
      if (this._visibilityHandler){
        window.removeEventListener('visibilitychange', this._visibilityHandler);
      }
      if (this._pageHideHandler){
        window.removeEventListener('pagehide', this._pageHideHandler);
      }
    }
  }

  track(eventType, props = {}, options = {}){
    if (!eventType) return;
    const ts = options.eventTs ? toMilliseconds(options.eventTs) : safeNow();
    const payload = {
      event_id: generateUlid(),
      ts,
      type: eventType,
      session_id: this.sessionId,
      anon_id: this.anonId,
      app: { ...this.app },
      ctx: {
        page: typeof location !== 'undefined' ? `${location.pathname}${location.hash}` : '',
        lang: safeLanguage(),
        viewport: safeViewport(),
      },
      props: cloneProps(props ?? {}),
    };
    if (options.immediate || IMMEDIATE_EVENTS.has(eventType)){
      this._send([payload], { useBeacon: true }).catch(() => {});
      return;
    }
    this.queue.push(payload);
    if (this.queue.length >= this.batchSize || this._estimateSize(this.queue) >= this.batchBytes){
      this.flush().catch(() => {});
    }
  }

  trackEntry(entry){
    if (!entry || !entry.event) return;
    const { event, timestamp, payload } = entry;
    const immediate = IMMEDIATE_EVENTS.has(event);
    this.track(event, payload ?? {}, { eventTs: timestamp, immediate });
  }

  async flush({ final = false } = {}){
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);
    try {
      await this._send(batch, { useBeacon: final });
    } catch (err){
      this.queue.unshift(...batch);
      throw err;
    }
  }

  async _send(events, { useBeacon = false } = {}){
    if (!events.length) return;
    const enriched = events.map((evt) => ({ ...evt, sent_at: safeNow() }));
    const body = JSON.stringify({ events: enriched });

    if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function'){
      const beaconOk = navigator.sendBeacon(this.endpoint, new Blob([body], { type: 'application/json' }));
      if (beaconOk) return;
    }

    const headers = { 'Content-Type': 'application/json' };
    const authHeader = await this._resolveToken();
    if (authHeader){
      headers.Authorization = authHeader;
    }

    if (typeof fetch !== 'function'){
      throw new Error('fetch is not available');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body,
      keepalive: useBeacon,
    });
    if (!response.ok){
      throw new Error(`Telemetry failed with status ${response.status}`);
    }
  }

  async _resolveToken(){
    if (!this.tokenEndpoint) return null;
    const now = safeNow();
    if (this.tokenCache && now < this.tokenExpiry - 10_000){
      return this.tokenCache;
    }
    if (typeof fetch !== 'function'){
      return null;
    }
    try {
      const resp = await fetch(this.tokenEndpoint, { method: 'GET' });
      if (!resp.ok) throw new Error(`token status ${resp.status}`);
      const data = await resp.json();
      if (!data?.token) throw new Error('token missing');
      this.tokenCache = `Bearer ${data.token}`;
      const payload = parseJwt(data.token);
      if (payload?.exp){
        this.tokenExpiry = payload.exp * 1000;
      } else {
        this.tokenExpiry = now + 4 * 60 * 1000;
      }
      return this.tokenCache;
    } catch (err){
      this.tokenCache = null;
      this.tokenExpiry = 0;
      return null;
    }
  }

  _estimateSize(events){
    try {
      return new Blob([JSON.stringify({ events })]).size;
    } catch (err){
      return JSON.stringify({ events }).length;
    }
  }
}

function decodeBase64Url(input){
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof atob === 'function'){
    return atob(normalized);
  }
  if (typeof Buffer !== 'undefined'){
    return Buffer.from(normalized, 'base64').toString('binary');
  }
  throw new Error('No base64 decoder available');
}

function parseJwt(token){
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = decodeBase64Url(payload);
    const json = decodeURIComponent(decoded.split('').map((c) => {
      const code = c.charCodeAt(0).toString(16).padStart(2, '0');
      return `%${code}`;
    }).join(''));
    return JSON.parse(json);
  } catch (err){
    return null;
  }
}

export function createTelemetryFromMeta(meta = {}){
  const endpoint = meta.endpoint || '/v1/events';
  const tokenEndpoint = meta.tokenEndpoint || null;
  const appVersion = meta.version || '0.0.0';
  const env = meta.env || (typeof location !== 'undefined' && location.hostname === 'localhost' ? 'dev' : 'prod');
  return new Telemetry({
    endpoint,
    tokenEndpoint,
    appVersion,
    env,
  });
}

export { IMMEDIATE_EVENTS };
