// Controlador de productos — cubre:
//   RF-01: catálogo con búsqueda y filtros por categoría, marca y precio.
//   RF-02: disponibilidad de inventario en tiempo real por producto
//          (siempre se lee `stock` directo de la BD, sin caché).
//   RF-06: panel administrativo (crear/editar/eliminar productos).
const { Op } = require('sequelize');
const { Product, Category, InventoryMovement, sequelize } = require('../models');

// GET /api/products?search=&categoryId=&brand=&minPrice=&maxPrice=
// Catálogo público con búsqueda y filtros. Solo devuelve productos activos.
async function list(req, res) {
  try {
    const { search, categoryId, brand, minPrice, maxPrice } = req.query;

    const where = { active: true };
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    if (categoryId) where.category_id = categoryId;
    if (brand) where.brand = brand;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });

    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener el catálogo', detail: err.message });
  }
}

// GET /api/products/:id — detalle de un producto, incluyendo su stock actual.
async function getById(req, res) {
  const product = await Product.findByPk(req.params.id, {
    include: [{ model: Category, attributes: ['id', 'name'] }],
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  return res.json(product);
}

// GET /api/products/:id/stock — endpoint ligero para RF-02: solo el
// número de unidades disponibles, pensado para refrescos frecuentes
// desde la vista de producto/carrito sin traer todo el objeto.
async function getStock(req, res) {
  const product = await Product.findByPk(req.params.id, { attributes: ['id', 'stock'] });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  return res.json({ productId: product.id, stock: product.stock });
}

// POST /api/products — solo administrador (RF-06).
async function create(req, res) {
  try {
    const { sku, name, description, brand, price, stock, imageUrl, categoryId } = req.body;
    if (!sku || !name || price === undefined || !categoryId) {
      return res.status(400).json({ error: 'sku, name, price y categoryId son obligatorios' });
    }

    const product = await sequelize.transaction(async (t) => {
      const created = await Product.create(
        {
          sku,
          name,
          description,
          brand,
          price,
          stock: stock || 0,
          image_url: imageUrl,
          category_id: categoryId,
        },
        { transaction: t }
      );

      if (stock && stock > 0) {
        await InventoryMovement.create(
          {
            product_id: created.id,
            type: 'entrada',
            quantity: stock,
            reason: 'Carga inicial de inventario',
          },
          { transaction: t }
        );
      }

      return created;
    });

    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear el producto', detail: err.message });
  }
}

// PUT /api/products/:id — solo administrador (RF-06).
async function update(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const { name, description, brand, price, imageUrl, categoryId, active } = req.body;
    await product.update({
      name: name ?? product.name,
      description: description ?? product.description,
      brand: brand ?? product.brand,
      price: price ?? product.price,
      image_url: imageUrl ?? product.image_url,
      category_id: categoryId ?? product.category_id,
      active: active ?? product.active,
    });

    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar el producto', detail: err.message });
  }
}

// PATCH /api/products/:id/stock — ajuste manual de inventario (RF-06),
// siempre registrando el movimiento para trazabilidad.
async function adjustStock(req, res) {
  try {
    const { quantity, reason } = req.body; // quantity puede ser positivo (entrada) o negativo (salida)
    if (!quantity || !reason) {
      return res.status(400).json({ error: 'quantity y reason son obligatorios' });
    }

    const result = await sequelize.transaction(async (t) => {
      const product = await Product.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product) throw new Error('Producto no encontrado');

      const newStock = product.stock + Number(quantity);
      if (newStock < 0) throw new Error('El ajuste dejaría el stock en negativo');

      await product.update({ stock: newStock }, { transaction: t });
      await InventoryMovement.create(
        {
          product_id: product.id,
          type: quantity > 0 ? 'entrada' : 'salida',
          quantity: Math.abs(quantity),
          reason,
        },
        { transaction: t }
      );

      return product;
    });

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// DELETE /api/products/:id — eliminación lógica (soft delete): se marca
// inactive en vez de borrar la fila, para no romper pedidos históricos
// que referencian este producto.
async function remove(req, res) {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  await product.update({ active: false });
  return res.status(204).send();
}

module.exports = { list, getById, getStock, create, update, adjustStock, remove };
