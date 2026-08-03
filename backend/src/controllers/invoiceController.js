// Controlador de facturas — consulta de la factura electrónica emitida
// para un pedido (RF-05). La emisión en sí ocurre automáticamente en
// orderController -> invoiceService; aquí solo se expone la consulta.
const { Invoice, Order } = require('../models');

async function getByOrderId(req, res) {
  const invoice = await Invoice.findOne({
    where: { order_id: req.params.orderId },
    include: [Order],
  });
  if (!invoice) return res.status(404).json({ error: 'Factura no encontrada para este pedido' });

  if (req.user.role === 'cliente' && invoice.Order.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  return res.json(invoice);
}

module.exports = { getByOrderId };
