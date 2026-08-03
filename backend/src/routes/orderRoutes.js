const { Router } = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

// Todas las rutas de pedidos requieren estar autenticado.
router.use(authenticate);

router.post('/checkout', orderController.checkout); // RF-03 / RF-04
router.get('/', orderController.list); // RF-08
router.get('/:id', orderController.getById); // RF-08
router.patch(
  '/:id/status',
  authorize('administrador', 'soporte'),
  orderController.updateStatus
); // RF-07 (dispara notificación)

module.exports = router;
