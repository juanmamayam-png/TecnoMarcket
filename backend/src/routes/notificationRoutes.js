const { Router } = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);
router.get('/', notificationController.list); // RF-07
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
