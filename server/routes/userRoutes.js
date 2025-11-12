const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/users', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/me', authMiddleware, userController.getMe);
router.get('/users', authMiddleware, userController.getAllUsers);
router.get('/users/:id', userController.getUser);

module.exports = router;
