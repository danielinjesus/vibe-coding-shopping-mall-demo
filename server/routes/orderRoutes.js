const router = require('express').Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// 모든 주문 라우트는 인증 필요
router.use(authMiddleware);

router.post('/order', orderController.createOrder);
router.get('/order', orderController.getOrders);
router.get('/orders/all', orderController.getAllOrders);  // 관리자: 전체 주문
router.get('/order/:orderId', orderController.getOrderById);
router.put('/order/:orderId/cancel', orderController.cancelOrder);
router.put('/order/:orderId/status', orderController.updateOrderStatus);

module.exports = router;
