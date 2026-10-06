import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure and serve static uploads directory
  const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API Router
  app.use('/api', apiRouter);

  // Fallback for unmatched API routes
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
  });

  // Vite development vs production static handling
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      error: 'Terjadi kesalahan internal pada server.',
      message: err?.message || 'Unknown error'
    });
  });

  const server = app.listen(PORT, HOST, () => {
    console.log(`Portal Pengawas Sekolah Server berjalan pada http://${HOST}:${PORT}`);
    console.log(`Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`Health check: http://${HOST}:${PORT}/api/health`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`Menerima sinyal ${signal}, menutup server dengan aman...`);
    server.close(() => {
      console.log('Server berhasil dimatikan.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
