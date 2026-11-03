import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Health check endpoint for Cloud Run / deployment healthchecks
app.get(['/healthz', '/api/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', app: 'Flappy Bird 2' });
});

const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Single Page Application fallback: all other routes serve index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.status(503).send('Application build in progress. Please run npm run build.');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Flappy Bird 2 server running on http://0.0.0.0:${PORT}`);
});
