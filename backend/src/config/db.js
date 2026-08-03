// Configuración central de la conexión a la base de datos.
// Se usa Sequelize como ORM sobre PostgreSQL para mapear las tablas
// (Usuario, Producto, Pedido, Factura, etc.) a clases de JavaScript.
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tecnomarket',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      // Sequelize por defecto pone nombres de tabla en plural en inglés;
      // usamos underscored para que las columnas queden como snake_case
      // (más estándar en PostgreSQL) y timestamps automáticos.
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;
