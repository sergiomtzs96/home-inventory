import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET no configurado');
  process.exit(1);
}

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiadas solicitudes. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import shoppingRoutes from './routes/shopping.js';
import ticketRoutes from './routes/ticket.js';

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/ticket', ticketRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando con Firebase' });
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
}

export default app;
