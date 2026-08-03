# TecnoMarket — E-commerce (Ingeniería de Software III)

Sistema completo (backend + frontend) construido a partir del Acta de
Constitución del proyecto: plataforma de e-commerce para TecnoMarket
que centraliza ventas en línea, inventario y facturación.

- **Backend**: Node.js + Express + PostgreSQL (Sequelize) — ver `backend/README.md`
- **Frontend**: React + Vite — ver `frontend/README.md`

## Puesta en marcha rápida

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env   # ajusta credenciales de PostgreSQL
createdb tecnomarket
npm run db:seed        # usuario admin + productos de ejemplo
npm run dev             # http://localhost:4000

# 2) Frontend (en otra terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Inicia sesión con `admin@tecnomarket.com` / `Admin123!` para acceder al
panel administrativo (`/admin`), o regístrate como cliente nuevo desde
`/register` para probar el flujo de compra completo.

## Cobertura de requerimientos funcionales

| Requerimiento | Dónde está implementado |
|---|---|
| RF-01 Catálogo con búsqueda/filtros | `frontend/src/pages/Catalog.jsx` + `backend .../productController.list` |
| RF-02 Inventario en tiempo real | `frontend/src/pages/ProductDetail.jsx` + `backend .../productController.getStock` |
| RF-03 Carrito de compras | `frontend/src/context/CartContext.jsx` |
| RF-04 Checkout con pasarela de pagos | `frontend/src/pages/Checkout.jsx` + `backend .../orderController.checkout` + `paymentService.js` |
| RF-05 Facturación electrónica automática | `backend .../invoiceService.js` (disparado desde `orderController`) |
| RF-06 Panel admin de productos | `frontend/src/pages/admin/AdminProducts.jsx` |
| RF-07 Notificaciones automáticas | `backend .../notificationService.js` |
| RF-08 Seguimiento de pedidos | `frontend/src/pages/OrderDetail.jsx` |
| RF-09 Reportes de ventas/inventario | `frontend/src/pages/admin/AdminReports.jsx` |
| RF-10 Usuarios y roles | `frontend/src/pages/admin/AdminUsers.jsx` + `backend middleware/auth.js` |
