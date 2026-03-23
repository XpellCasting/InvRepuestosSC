import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productosRouter from './routes/productos.js';
import distribuidoresRouter from './routes/distribuidores.js';
import ticketsRouter from './routes/tickets.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3000;

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Mounted API routers
app.use('/api/productos', productosRouter);
app.use('/api/distribuidores', distribuidoresRouter);
app.use('/api/tickets', ticketsRouter);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
