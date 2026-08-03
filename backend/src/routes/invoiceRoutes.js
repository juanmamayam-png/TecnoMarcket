const { Router } = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);
router.get('/order/:orderId', invoiceController.getByOrderId); // RF-05

module.exports = router;
