// Controlador de categorías — usado para poblar el filtro de categoría
// del catálogo (RF-01) y para la gestión de productos en el panel admin.
const { Category } = require('../models');

async function list(req, res) {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  return res.json(categories);
}

async function create(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name es obligatorio' });
  const category = await Category.create({ name });
  return res.status(201).json(category);
}

module.exports = { list, create };
