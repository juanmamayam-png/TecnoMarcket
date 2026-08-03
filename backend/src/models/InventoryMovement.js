// Modelo InventoryMovement — bitácora de cada cambio de stock.
// No reemplaza el campo `stock` de Product (que es el valor rápido a
// leer), sino que registra el historial: quién movió inventario, cuánto
// y por qué (venta, reposición, ajuste manual). Es la base de los
// reportes de inventario (RF-09) y de la auditoría ante discrepancias.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventoryMovement = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = InventoryMovement;
