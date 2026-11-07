/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const distDir = path.join(__dirname, 'dist');

// Health check endpoint for Cloud Run and container orchestration
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from built frontend
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // SPA fallback: any other request returns index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  // Fallback if built files are not generated yet
  app.get('*', (_req, res) => {
    res.status(503).send('Application build in progress. Please refresh momentarily.');
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
