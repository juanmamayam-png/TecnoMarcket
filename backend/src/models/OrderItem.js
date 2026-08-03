// Modelo OrderItem — cada renglón de un pedido (producto, cantidad,
// precio unitario en el momento de la compra). Guardar `unit_price` aquí
// (y no solo referenciar Product.price) es importante: si el precio del
// producto cambia después, el histórico del pedido no se altera.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
});

module.exports = OrderItem;
