import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './server/config.js';
import { initDatabase } from './server/db/database.js';
import authRoutes from './server/routes/auth.js';
import productRoutes from './server/routes/products.js';
import cartRoutes from './server/routes/cart.js';
import orderRoutes from './server/routes/orders.js';
import paymentRoutes from './server/routes/payment.js';
import paymentsRoutes from './server/routes/payments.js';
import dashboardRoutes from './server/routes/dashboard.js';
import loanRoutes from './server/routes/loans.js';
import investmentRoutes from './server/routes/investments.js';
import aiRoutes from './server/routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.APPLET_ID ? 3000 : (Number(process.env.PORT) || 3000);

  // Initialize Database
  await initDatabase();

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'FinCommerce API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/investments', investmentRoutes);
  app.use('/api/ai', aiRoutes);

  // Catch unhandled API requests
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Vite middleware for development vs Static file server for production
  const isProduction = process.env.NODE_ENV === 'production' || import.meta.url.includes('/dist/');
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus E-Commerce Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
