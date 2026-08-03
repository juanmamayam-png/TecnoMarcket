// Modelo Producto — soporta RF-01 (catálogo con búsqueda/filtros),
// RF-02 (disponibilidad de inventario en tiempo real) y RF-06 (panel
// administrativo para crear/editar/eliminar productos).
//
// El campo `stock` es la fuente de verdad del inventario en tiempo real:
// se lee directamente al mostrar el catálogo (sin caché) y se actualiza
// de forma atómica dentro de una transacción cada vez que se confirma
// una compra (ver orderController.js), evitando condiciones de carrera
// entre dos compras simultáneas del mismo producto.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  active: {
    // Los productos "inactivos" no aparecen en el catálogo público,
    // pero se conservan para no romper el historial de pedidos.
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Product;
