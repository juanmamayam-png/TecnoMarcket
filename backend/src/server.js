require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models'); // registra las asociaciones antes de sincronizar

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');

    // En desarrollo, sincroniza el esquema automáticamente. En
    // producción se recomienda usar migraciones (sequelize-cli) en vez
    // de sync() para no aplicar cambios de esquema sin control.
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Modelos sincronizados con la base de datos.');
    }

    app.listen(PORT, () => {
      console.log(`API de TecnoMarket escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
