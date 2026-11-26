import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleGeminiClassify,
  handleGeminiHealth,
  handleGeminiUtterance,
} from './src/llm/geminiApi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/gemini/health', (_req, res) => {
    const result = handleGeminiHealth();
    res.status(result.status).json(result.body);
  });

  // Klasifikasi keterampilan konseling dari masukan bebas konselor
  app.post('/api/gemini/classify', async (req, res) => {
    const result = await handleGeminiClassify(req.body);
    res.status(result.status).json(result.body);
  });

  // Pembangkitan ucapan mahasiswa berdasarkan kartu keadaan terbatas
  app.post('/api/gemini/utterance', async (req, res) => {
    const result = await handleGeminiUtterance(req.body);
    res.status(result.status).json(result.body);
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        next();
        return;
      }
      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        let html = fs.readFileSync(templatePath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RUANG DENGAR] Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

createServer();
