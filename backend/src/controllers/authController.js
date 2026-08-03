// Controlador de autenticación — registro, login y perfil del usuario
// autenticado. Base de RF-10 (gestión de usuarios y roles): todo cliente
// que se registra queda por defecto con rol "cliente"; los roles
// "administrador" y "soporte" solo los asigna otro administrador desde
// userController.js, nunca desde el registro público.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

// Nunca se debe devolver password_hash al cliente.
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password_hash,
      phone,
      role: 'cliente',
    });

    const token = signToken(user);
    return res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    return res.status(500).json({ error: 'Error al registrar el usuario', detail: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signToken(user);
    return res.json({ user: toPublicUser(user), token });
  } catch (err) {
    return res.status(500).json({ error: 'Error al iniciar sesión', detail: err.message });
  }
}

async function me(req, res) {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  return res.json(toPublicUser(user));
}

module.exports = { register, login, me };
