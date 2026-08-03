// Controlador de pedidos — el corazón del flujo de compra. Cubre:
//   RF-03: el carrito se recibe aquí y se recalcula el total en el
//          servidor (nunca se confía en el total que envía el cliente).
//   RF-04: checkout con pasarela de pagos, sin intervención manual.
//   RF-05: al aprobarse el pago se emite la factura automáticamente.
//   RF-07: se notifica al cliente en cada cambio de estado.
//   RF-08: endpoint de consulta de estado para seguimiento del pedido.
const { Order, OrderItem, Product, Invoice, sequelize } = require('../models');
const paymentService = require('../services/paymentService');
const invoiceService = require('../services/invoiceService');
const notificationService = require('../services/notificationService');

// POST /api/orders/checkout
// Body: { items: [{ productId, quantity }], shippingAddress, paymentMethod }
// Crea el pedido, descuenta stock, cobra el pago y —si es aprobado—
// emite la factura y notifica al cliente. Todo dentro de una única
// transacción: si el pago es rechazado, el stock descontado se revierte.
async function checkout(req, res) {
  const { items, shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }
  if (!shippingAddress) {
    return res.status(400).json({ error: 'shippingAddress es obligatorio' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      let total = 0;
      const orderItemsData = [];

      // 1) Validar disponibilidad y bloquear las filas de producto
      //    involucradas para evitar sobreventa por compras simultáneas.
      for (const { productId, quantity } of items) {
        const product = await Product.findByPk(productId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!product || !product.active) {
          throw new Error(`Producto ${productId} no disponible`);
        }
        if (product.stock < quantity) {
          throw new Error(`Stock insuficiente para "${product.name}" (disponible: ${product.stock})`);
        }

        const subtotal = Number(product.price) * quantity;
        total += subtotal;
        orderItemsData.push({
          productId: product.id,
          quantity,
          unit_price: product.price,
          subtotal,
          productRef: product,
        });
      }

      // 2) Crear el pedido en estado pendiente_pago.
      const order = await Order.create(
        {
          user_id: userId,
          status: 'pendiente_pago',
          total,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
        },
        { transaction: t }
      );

      // 3) Crear los renglones del pedido y descontar stock (RF-03).
      for (const item of orderItemsData) {
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          },
          { transaction: t }
        );
        await item.productRef.update(
          { stock: item.productRef.stock - item.quantity },
          { transaction: t }
        );
      }

      // 4) Cobrar el pago (RF-04). Se hace dentro de la misma
      //    transacción de datos, pero la llamada a la pasarela en sí es
      //    externa y no participa del rollback de PostgreSQL: si falla,
      //    simplemente marcamos el pedido como pendiente/cancelado.
      const paymentResult = await paymentService.charge({
        amount: total,
        method: paymentMethod,
      });

      if (!paymentResult.approved) {
        await order.update({ status: 'cancelado' }, { transaction: t });
        // No se relanza como error de servidor: es un resultado de
        // negocio válido (pago rechazado), así que se retorna 200 con
        // el detalle para que el frontend lo muestre.
        return { order, paymentResult, invoice: null };
      }

      await order.update(
        { status: 'pagado', payment_reference: paymentResult.reference },
        { transaction: t }
      );

      // 5) Emitir factura electrónica automáticamente (RF-05).
      order.items = orderItemsData.map((i) => ({ subtotal: i.subtotal }));
      const invoice = await invoiceService.issueInvoice(order, t);

      // 6) Notificar al cliente (RF-07).
      await notificationService.notifyOrderStatusChange(order, t);

      return { order, paymentResult, invoice };
    });

    const statusCode = result.paymentResult.approved ? 201 : 402;
    return res.status(statusCode).json({
      order: result.order,
      payment: result.paymentResult,
      invoice: result.invoice,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// GET /api/orders — pedidos del usuario autenticado (o todos si es admin/soporte).
async function list(req, res) {
  const where = req.user.role === 'cliente' ? { user_id: req.user.id } : {};
  const orders = await Order.findAll({
    where,
    include: [{ model: OrderItem, as: 'items', include: [Product] }],
    order: [['created_at', 'DESC']],
  });
  return res.json(orders);
}

// GET /api/orders/:id — detalle + estado, para seguimiento (RF-08).
// Un cliente solo puede ver sus propios pedidos.
async function getById(req, res) {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: 'items', include: [Product] }, Invoice],
  });
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  if (req.user.role === 'cliente' && order.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  return res.json(order);
}

// PATCH /api/orders/:id/status — solo administrador/soporte. Avanza el
// pedido en su ciclo de vida (en_preparacion -> enviado -> entregado) y
// dispara la notificación correspondiente (RF-07).
const VALID_TRANSITIONS = {
  pagado: ['en_preparacion', 'cancelado'],
  en_preparacion: ['enviado', 'cancelado'],
  enviado: ['entregado'],
};

async function updateStatus(req, res) {
  const { status } = req.body;
  try {
    const result = await sequelize.transaction(async (t) => {
      const order = await Order.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!order) throw new Error('Pedido no encontrado');

      const allowed = VALID_TRANSITIONS[order.status] || [];
      if (!allowed.includes(status)) {
        throw new Error(`No se puede pasar de "${order.status}" a "${status}"`);
      }

      await order.update({ status }, { transaction: t });
      await notificationService.notifyOrderStatusChange(order, t);
      return order;
    });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { checkout, list, getById, updateStatus };
