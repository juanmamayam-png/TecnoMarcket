// Controlador de notificaciones — bandeja de notificaciones del usuario
// autenticado (RF-07) y marcado de lectura.
const { Notification } = require('../models');

async function list(req, res) {
  const notifications = await Notification.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']],
  });
  return res.json(notifications);
}

async function markAsRead(req, res) {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification || notification.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Notificación no encontrada' });
  }
  await notification.update({ read: true });
  return res.json(notification);
}

module.exports = { list, markAsRead };
