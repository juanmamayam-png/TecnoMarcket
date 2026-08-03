// Modelo Usuario — soporta RF-10 (gestión de usuarios y roles).
// El rol determina qué puede hacer cada usuario en el sistema:
//   - cliente:       navega el catálogo, compra, ve sus pedidos/facturas
//   - administrador:  gestiona productos, inventario, usuarios y reportes
//   - soporte:        consulta pedidos e incidencias de clientes
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  // Nunca se guarda la contraseña en texto plano: se guarda el hash
  // generado con bcrypt (ver authController.js).
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('cliente', 'administrador', 'soporte'),
    allowNull: false,
    defaultValue: 'cliente',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = User;
