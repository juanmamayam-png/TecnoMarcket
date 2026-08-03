// Servicio de facturación — genera la factura electrónica de un pedido.
// Se invoca automáticamente desde orderController justo después de que
// un pago es aprobado, nunca manualmente, para cumplir RF-05 ("toda
// venta genera una factura válida conforme a normativa vigente").
const { Invoice } = require('../models');

async function getNextInvoiceNumber(transaction) {
  const year = new Date().getFullYear();
  const count = await Invoice.count({ transaction });
  const consecutive = String(count + 1).padStart(6, '0');
  return `FE-${year}-${consecutive}`;
}

/**
 * Crea la factura electrónica asociada a un pedido ya pagado.
 * @param {import('../models').Order} order - Pedido con sus items cargados.
 * @param {import('sequelize').Transaction} transaction
 */
async function issueInvoice(order, transaction) {
  const subtotal = order.items.reduce(
    (acc, item) => acc + Number(item.subtotal),
    0
  );
  // Nota: el IVA/impuestos se deja parametrizado en 0 por defecto; en un
  // entorno real se calcularía según el régimen tributario aplicable.
  const tax = 0;
  const total = subtotal + tax;

  const invoiceNumber = await getNextInvoiceNumber(transaction);

  const invoice = await Invoice.create(
    {
      order_id: order.id,
      invoice_number: invoiceNumber,
      subtotal,
      tax,
      total,
      status: 'emitida',
    },
    { transaction }
  );

  return invoice;
}

module.exports = { issueInvoice };
