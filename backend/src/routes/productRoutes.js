const { Router } = require('express');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

// --- Catálogo público (RF-01, RF-02) — no requiere autenticación ---
router.get('/', productController.list);
router.get('/categories', categoryController.list);
router.get('/:id', productController.getById);
router.get('/:id/stock', productController.getStock);

// --- Gestión (RF-06) — solo administrador ---
router.post('/', authenticate, authorize('administrador'), productController.create);
router.post('/categories', authenticate, authorize('administrador'), categoryController.create);
router.put('/:id', authenticate, authorize('administrador'), productController.update);
router.patch('/:id/stock', authenticate, authorize('administrador'), productController.adjustStock);
router.delete('/:id', authenticate, authorize('administrador'), productController.remove);

module.exports = router;
