// Punto de entrada para Vercel. Vercel convierte cada archivo dentro de
// /api en una función serverless; este archivo simplemente reexpone la
// app de Express ya configurada en src/app.js, sin llamar a .listen()
// (Vercel maneja el ciclo de vida HTTP por fuera).
//
// server.js (usado para desarrollo local / cualquier otro hosting
// tradicional) sigue intacto y sigue siendo el punto de entrada para
// `npm run dev`.
require('dotenv').config();
require('../src/models'); // registra las asociaciones antes de manejar requests

const app = require('../src/app');

module.exports = app;
