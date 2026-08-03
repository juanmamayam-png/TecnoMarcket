// Modelo Factura — soporta RF-05 (factura electrónica automática por
// cada pedido). Se genera automáticamente cuando el pedido pasa a estado
// "pagado" (ver invoiceService.js), nunca de forma manual, para cumplir
// el criterio de aceptación "toda venta genera una factura válida".
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoice_number: {
    // Consecutivo único legible, ej. FE-2026-000123
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  tax: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('emitida', 'anulada'),
    allowNull: false,
    defaultValue: 'emitida',
  },
});

module.exports = Invoice;
