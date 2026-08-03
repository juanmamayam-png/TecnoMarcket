// Punto único donde se declaran las asociaciones (relaciones) entre
// todos los modelos. Centralizarlas aquí (en vez de dentro de cada
// archivo de modelo) evita dependencias circulares entre requires y deja
// el "mapa" completo de la base de datos visible en un solo lugar.
const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const InventoryMovement = require('./InventoryMovement');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Invoice = require('./Invoice');
const Notification = require('./Notification');

// --- Categoría 1—N Producto ---
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// --- Producto 1—N Movimiento de inventario ---
Product.hasMany(InventoryMovement, { foreignKey: 'product_id' });
InventoryMovement.belongsTo(Product, { foreignKey: 'product_id' });

// --- Usuario 1—N Pedido (un cliente puede tener muchos pedidos) ---
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// --- Pedido 1—N OrderItem (líneas del pedido) ---
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// --- Producto 1—N OrderItem ---
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// --- Pedido 1—1 Factura ---
Order.hasOne(Invoice, { foreignKey: 'order_id' });
Invoice.belongsTo(Order, { foreignKey: 'order_id' });

// --- Usuario 1—N Notificación ---
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// --- Pedido 1—N Notificación (una notificación suele referirse a un pedido) ---
Order.hasMany(Notification, { foreignKey: 'order_id' });
Notification.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  InventoryMovement,
  Order,
  OrderItem,
  Invoice,
  Notification,
};
