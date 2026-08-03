const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('administrador')); // RF-10

router.get('/', userController.list);
router.patch('/:id/role', userController.updateRole);
router.patch('/:id/active', userController.setActive);

module.exports = router;
