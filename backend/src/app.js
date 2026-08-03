// Configuración de la aplicación Express: middlewares globales, montaje
// de rutas por módulo y manejo centralizado de errores. Separado de
// server.js para poder importar `app` en pruebas sin levantar un puerto.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// 404 para rutas no encontradas
app.use((req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));

// Manejador de errores centralizado — cualquier `next(err)` cae aquí.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
