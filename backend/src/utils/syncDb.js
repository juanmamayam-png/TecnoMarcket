// Script de sincronización de esquema. Uso: npm run db:sync
// Crea (o actualiza) las tablas en la base de datos apuntada por
// DATABASE_URL (o las variables DB_* sueltas). Se usa una sola vez
// después de desplegar contra una base de datos nueva en la nube
// (Neon, Supabase, etc.), ya que en producción server.js/api no
// sincroniza el esquema automáticamente (ver server.js).
require('dotenv').config();
const sequelize = require('../config/db');
require('../models'); // registra las asociaciones antes de sincronizar

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Esquema sincronizado correctamente.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error al sincronizar el esquema:', err);
    process.exit(1);
  });
