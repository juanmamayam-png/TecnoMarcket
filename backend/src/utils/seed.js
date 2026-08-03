// Script de datos de prueba (seed). Uso: npm run db:seed
// Crea un usuario administrador, categorías y algunos productos de
// ejemplo para poder probar el catálogo y el flujo de compra sin tener
// que cargar todo manualmente.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, Category, Product } = require('../models');

async function seed() {
  await sequelize.sync({ alter: true });

  const [admin] = await User.findOrCreate({
    where: { email: 'admin@tecnomarket.com' },
    defaults: {
      name: 'Administrador TecnoMarket',
      password_hash: await bcrypt.hash('Admin123!', 10),
      role: 'administrador',
    },
  });
  console.log(`Usuario administrador listo: ${admin.email} / Admin123!`);

  const categorias = ['Computadores', 'Celulares', 'Accesorios', 'Audio'];
  const categoryMap = {};
  for (const name of categorias) {
    const [cat] = await Category.findOrCreate({ where: { name } });
    categoryMap[name] = cat.id;
  }

  const productos = [
    { sku: 'COMP-001', name: 'Portátil 14" Ryzen 5', brand: 'AcerTech', price: 2350000, stock: 15, category: 'Computadores' },
    { sku: 'CEL-001', name: 'Smartphone 128GB', brand: 'Nova', price: 980000, stock: 30, category: 'Celulares' },
    { sku: 'ACC-001', name: 'Mouse inalámbrico', brand: 'Nova', price: 65000, stock: 80, category: 'Accesorios' },
    { sku: 'AUD-001', name: 'Audífonos Bluetooth', brand: 'SoundMax', price: 150000, stock: 40, category: 'Audio' },
  ];

  for (const p of productos) {
    await Product.findOrCreate({
      where: { sku: p.sku },
      defaults: {
        name: p.name,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        category_id: categoryMap[p.category],
      },
    });
  }
  console.log(`${productos.length} productos de ejemplo cargados.`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
});
