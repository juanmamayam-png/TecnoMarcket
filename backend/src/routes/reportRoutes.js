const { Router } = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('administrador')); // RF-09

router.get('/sales', reportController.salesReport);
router.get('/inventory', reportController.inventoryReport);

module.exports = router;
