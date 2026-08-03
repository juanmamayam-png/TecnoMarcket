// Configuración central de la conexión a la base de datos.
// Se usa Sequelize como ORM sobre PostgreSQL para mapear las tablas
// (Usuario, Producto, Pedido, Factura, etc.) a clases de JavaScript.
const { Sequelize } = require('sequelize');
require('dotenv').config();

const commonOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    // Sequelize por defecto pone nombres de tabla en plural en inglés;
    // usamos underscored para que las columnas queden como snake_case
    // (más estándar en PostgreSQL) y timestamps automáticos.
    underscored: true,
    timestamps: true,
  },
  // En entornos serverless (Vercel) cada invocación puede crear una
  // conexión nueva; un pool pequeño evita agotar el límite de
  // conexiones concurrentes del proveedor (ej. Neon).
  pool: { max: 5, min: 0, idle: 10000, acquire: 30000 },
};

// DATABASE_URL es el formato que usan los proveedores en la nube
// (Neon, Supabase, Vercel Postgres): postgres://usuario:pass@host/db.
// Requieren SSL, que se activa automáticamente cuando esta variable
// está presente. En desarrollo local (sin DATABASE_URL) se arma la
// conexión con las variables sueltas del .env, sin SSL.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      ...commonOptions,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'tecnomarket',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        ...commonOptions,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
      }
    );

module.exports = sequelize;
