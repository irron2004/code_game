import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const buildDir = path.resolve(__dirname, 'algorithm-game');
const port = process.env.PORT || 8080;

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
});
