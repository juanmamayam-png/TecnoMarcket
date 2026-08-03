// Modelo Notificación — soporta RF-07 (notificaciones automáticas al
// cliente en cada cambio de estado del pedido: confirmación, envío,
// entrega). En este proyecto se guarda como notificación "in-app"
// consultable desde el frontend; el mismo punto de disparo
// (orderController -> notificationService) es donde en producción se
// conectaría un proveedor real de email/SMS.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Notification;
