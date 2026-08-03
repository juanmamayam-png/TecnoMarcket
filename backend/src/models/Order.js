// Modelo Pedido (Order) — soporta RF-03 (carrito → pedido), RF-04
// (checkout/pago) y RF-08 (seguimiento del estado del pedido).
//
// El campo `status` modela el ciclo de vida completo del pedido y es lo
// que el cliente consulta en "Mis pedidos" y lo que dispara las
// notificaciones automáticas de RF-07:
//   pendiente_pago -> pagado -> en_preparacion -> enviado -> entregado
//                  -> cancelado (en cualquier punto antes de "enviado")
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM(
      'pendiente_pago',
      'pagado',
      'en_preparacion',
      'enviado',
      'entregado',
      'cancelado'
    ),
    allowNull: false,
    defaultValue: 'pendiente_pago',
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  shipping_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('tarjeta', 'pse', 'otro'),
    allowNull: true,
  },
  payment_reference: {
    // Referencia devuelta por la pasarela de pagos (ver paymentService.js)
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Order;
