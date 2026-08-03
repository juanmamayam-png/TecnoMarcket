// Servicio de notificaciones — soporta RF-07 (notificaciones automáticas
// en cada cambio de estado del pedido). Se centraliza aquí el texto de
// cada evento para que sea consistente y fácil de traducir/ajustar.
const { Notification } = require('../models');

const MESSAGES = {
  pagado: (order) => `Confirmamos el pago de tu pedido #${order.id.slice(0, 8)}.`,
  en_preparacion: (order) => `Tu pedido #${order.id.slice(0, 8)} está siendo preparado.`,
  enviado: (order) => `Tu pedido #${order.id.slice(0, 8)} fue enviado.`,
  entregado: (order) => `Tu pedido #${order.id.slice(0, 8)} fue entregado. ¡Gracias por tu compra!`,
  cancelado: (order) => `Tu pedido #${order.id.slice(0, 8)} fue cancelado.`,
};

/**
 * Crea una notificación in-app para el cliente cuando cambia el estado
 * de su pedido. Si en el futuro se conecta un proveedor real de
 * email/SMS, este es el único punto que habría que ampliar.
 */
async function notifyOrderStatusChange(order, transaction) {
  const buildMessage = MESSAGES[order.status];
  if (!buildMessage) return null; // estado sin notificación definida (ej. pendiente_pago)

  return Notification.create(
    {
      user_id: order.user_id,
      order_id: order.id,
      message: buildMessage(order),
    },
    { transaction }
  );
}

module.exports = { notifyOrderStatusChange };
