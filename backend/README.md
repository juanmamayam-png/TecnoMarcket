# TecnoMarket — Backend (API REST)

API REST construida con **Node.js + Express + PostgreSQL (Sequelize)** que
implementa los requerimientos funcionales del Acta de Constitución:
catálogo (RF-01/RF-02), carrito/checkout con pago (RF-03/RF-04),
facturación electrónica automática (RF-05), panel administrativo
(RF-06), notificaciones (RF-07), seguimiento de pedidos (RF-08),
reportes (RF-09) y gestión de usuarios/roles (RF-10).

## Requisitos

- Node.js 18+
- PostgreSQL 14+ corriendo localmente (o accesible por red)

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con los datos de tu base de datos PostgreSQL
```

Crea la base de datos vacía (una sola vez):

```bash
createdb tecnomarket
```

## Ejecución

```bash
npm run dev        # levanta el servidor con recarga automática (nodemon)
npm run db:seed    # (opcional) carga usuario admin + productos de ejemplo
```

El servidor queda disponible en `http://localhost:4000`.
Usuario admin de prueba tras el seed: `admin@tecnomarket.com` / `Admin123!`.

## Estructura

```
src/
  config/db.js          # Conexión Sequelize a PostgreSQL
  models/                # Entidades: User, Product, Category, Order, OrderItem, Invoice, Notification, InventoryMovement
  middleware/auth.js     # JWT + control de acceso por rol
  services/               # Lógica reutilizable: pagos, facturación, notificaciones
  controllers/             # Lógica de cada endpoint
  routes/                  # Definición de rutas por módulo
  app.js / server.js       # Bootstrap de Express
```

## Endpoints principales

| Método | Ruta                              | Descripción                          | Rol requerido       |
|--------|------------------------------------|---------------------------------------|----------------------|
| POST   | /api/auth/register                 | Registro de cliente                   | público              |
| POST   | /api/auth/login                    | Login                                 | público              |
| GET    | /api/products                      | Catálogo con filtros (RF-01)          | público              |
| GET    | /api/products/:id/stock            | Stock en tiempo real (RF-02)          | público              |
| POST   | /api/products                      | Crear producto (RF-06)                | administrador        |
| POST   | /api/orders/checkout               | Checkout + pago (RF-03/04)            | autenticado          |
| GET    | /api/orders/:id                    | Seguimiento de pedido (RF-08)         | autenticado          |
| PATCH  | /api/orders/:id/status             | Cambiar estado + notificar (RF-07)    | administrador/soporte|
| GET    | /api/invoices/order/:orderId       | Consultar factura (RF-05)             | autenticado          |
| GET    | /api/reports/sales                 | Reporte de ventas (RF-09)             | administrador        |
| GET    | /api/reports/inventory             | Reporte de inventario (RF-09)         | administrador        |
| GET    | /api/users                         | Listar usuarios (RF-10)               | administrador        |
| PATCH  | /api/users/:id/role                | Cambiar rol (RF-10)                   | administrador        |
