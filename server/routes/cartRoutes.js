const router = require('express').Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// 모든 장바구니 라우트는 인증 필요
router.use(authMiddleware);

router.get('/cart', cartController.getCart);
router.post('/cart', cartController.addToCart);
router.put('/cart/quantity', cartController.updateQuantity);
router.put('/cart/select', cartController.toggleSelect);
router.delete('/cart/:productId', cartController.removeFromCart);
router.delete('/cart', cartController.clearCart);

module.exports = router;
