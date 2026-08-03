// Controlador de usuarios — gestión de usuarios y roles (RF-10), acceso
// exclusivo para administradores (ver userRoutes.js).
const { User } = require('../models');

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    active: user.active,
  };
}

async function list(req, res) {
  const users = await User.findAll({ order: [['name', 'ASC']] });
  return res.json(users.map(toPublicUser));
}

// PATCH /api/users/:id/role — cambia el rol de un usuario.
async function updateRole(req, res) {
  const { role } = req.body;
  if (!['cliente', 'administrador', 'soporte'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  await user.update({ role });
  return res.json(toPublicUser(user));
}

// PATCH /api/users/:id/active — activa/desactiva una cuenta.
async function setActive(req, res) {
  const { active } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  await user.update({ active: !!active });
  return res.json(toPublicUser(user));
}

module.exports = { list, updateRole, setActive };
