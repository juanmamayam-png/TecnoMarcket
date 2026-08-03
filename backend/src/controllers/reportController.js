// Controlador de reportes — soporta RF-09 (reportes de ventas e
// inventario para la Gerencia Comercial, exportables por rango de
// fechas). Aquí se devuelven como JSON; el frontend los presenta en
// tabla y ofrece exportarlos a CSV/Excel (ver AdminReports.jsx).
const { Op } = require('sequelize');
const { Order, OrderItem, Product, InventoryMovement, sequelize } = require('../models');

// GET /api/reports/sales?from=&to=
async function salesReport(req, res) {
  const { from, to } = req.query;
  const where = { status: { [Op.in]: ['pagado', 'en_preparacion', 'enviado', 'entregado'] } };
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = new Date(from);
    if (to) where.created_at[Op.lte] = new Date(to);
  }

  const orders = await Order.findAll({
    where,
    include: [{ model: OrderItem, as: 'items', include: [Product] }],
    order: [['created_at', 'DESC']],
  });

  const totalVentas = orders.reduce((acc, o) => acc + Number(o.total), 0);
  const totalPedidos = orders.length;

  // Ventas agrupadas por producto, para identificar los más vendidos.
  const porProducto = {};
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.Product ? item.Product.name : item.product_id;
      if (!porProducto[key]) porProducto[key] = { unidades: 0, total: 0 };
      porProducto[key].unidades += item.quantity;
      porProducto[key].total += Number(item.subtotal);
    }
  }

  return res.json({
    rango: { from: from || null, to: to || null },
    totalVentas,
    totalPedidos,
    porProducto,
    pedidos: orders,
  });
}

// GET /api/reports/inventory — estado actual de stock + movimientos
// recientes, para verificar exactitud de inventario (OE-2 / RNF asociado).
async function inventoryReport(req, res) {
  const products = await Product.findAll({
    attributes: ['id', 'sku', 'name', 'stock', 'price'],
    order: [['stock', 'ASC']],
  });

  const movements = await InventoryMovement.findAll({
    include: [{ model: Product, attributes: ['name', 'sku'] }],
    order: [['created_at', 'DESC']],
    limit: 50,
  });

  const valorInventario = products.reduce(
    (acc, p) => acc + Number(p.price) * p.stock,
    0
  );

  return res.json({ productos: products, valorInventario, movimientosRecientes: movements });
}

module.exports = { salesReport, inventoryReport };
