const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const axios = require('axios');

const orderController = {};

// 아임포트 액세스 토큰 발급
const getIamportToken = async () => {
  try {
    const response = await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: process.env.IAMPORT_API_KEY,
      imp_secret: process.env.IAMPORT_API_SECRET
    });
    return response.data.response.access_token;
  } catch (error) {
    console.error('아임포트 토큰 발급 실패:', error.response?.data || error.message);
    throw new Error('Payment verification failed');
  }
};

// 아임포트 결제 정보 조회
const verifyIamportPayment = async (imp_uid, expectedAmount) => {
  try {
    const token = await getIamportToken();
    const response = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: { Authorization: token }
    });

    const payment = response.data.response;

    // 결제 상태 확인
    if (payment.status !== 'paid') {
      throw new Error('Payment not completed');
    }

    // 결제 금액 확인
    if (payment.amount !== expectedAmount) {
      throw new Error('Payment amount mismatch');
    }

    return payment;
  } catch (error) {
    console.error('아임포트 결제 검증 실패:', error.response?.data || error.message);
    throw new Error('Payment verification failed');
  }
};

// 주문 생성
orderController.createOrder = async (req, res) => {
  try {
    console.log('주문 생성 요청:', {
      userId: req.userId,
      body: req.body
    });

    const { shippingAddress, recipientName, recipientPhone, paymentMethod, totalAmount, items, imp_uid } = req.body;

    if (!req.userId) {
      console.error('userId가 없습니다.');
      return res.status(401).json({ status: 'fail', error: 'Unauthorized - No user ID' });
    }

    let orderItems = [];
    let calculatedTotal = 0;

    // 직접 구매 모드 (items가 전달된 경우)
    if (items && items.length > 0) {
      console.log('직접 구매 모드');
      orderItems = items;

      // 총액 재계산 (보안)
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ status: 'fail', error: 'Product not found' });
        }
        calculatedTotal += product.price * item.quantity;
        orderItems[orderItems.indexOf(item)] = {
          product: product._id,
          quantity: item.quantity
        };
      }
    } else {
      // 장바구니 모드
      console.log('장바구니 모드');
      const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
      console.log('장바구니 조회 결과:', cart);

      if (!cart || cart.items.length === 0) {
        console.error('장바구니가 비어있습니다.');
        return res.status(400).json({ status: 'fail', error: 'Cart is empty' });
      }

      // 선택된 상품만 필터링
      const selectedItems = cart.items.filter(item => item.selected);
      console.log('선택된 상품:', selectedItems.length);

      if (selectedItems.length === 0) {
        console.error('선택된 상품이 없습니다.');
        return res.status(400).json({ status: 'fail', error: 'No items selected' });
      }

      // 총액 계산
      calculatedTotal = selectedItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      orderItems = selectedItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      // 장바구니에서 주문한 상품 제거
      cart.items = cart.items.filter(item => !item.selected);
      await cart.save();
    }

    console.log('총액:', calculatedTotal);

    // 아임포트 결제 검증 (imp_uid가 있는 경우)
    if (imp_uid) {
      try {
        await verifyIamportPayment(imp_uid, calculatedTotal);
        console.log('아임포트 결제 검증 완료:', imp_uid);
      } catch (error) {
        console.error('아임포트 검증 실패:', error.message);
        return res.status(400).json({
          status: 'fail',
          error: error.message
        });
      }
    }

    // 결제 금액 검증 (클라이언트에서 보낸 금액과 서버 계산 금액 비교)
    if (totalAmount && Math.abs(totalAmount - calculatedTotal) > 0.01) {
      console.error('결제 금액 불일치:', { totalAmount, calculatedTotal });
      return res.status(400).json({
        status: 'fail',
        error: 'Payment amount mismatch'
      });
    }

    // 주문 중복 체크 (최근 5분 이내 동일 금액 및 상품 구성)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOrder = await Order.findOne({
      user: req.userId,
      totalAmount: calculatedTotal,
      createdAt: { $gte: fiveMinutesAgo },
      orderStatus: { $ne: 'cancelled' }
    });

    if (recentOrder) {
      console.error('중복 주문 감지:', recentOrder.orderNumber);
      return res.status(400).json({
        status: 'fail',
        error: 'Duplicate order detected'
      });
    }

    // 주문번호 생성
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${date}-${String(count + 1).padStart(3, '0')}`;

    console.log('생성된 주문번호:', orderNumber);

    // 주문 생성
    const order = await Order.create({
      orderNumber,
      user: req.userId,
      items: orderItems,
      shippingAddress,
      recipientName,
      recipientPhone,
      totalAmount: calculatedTotal,
      paymentMethod,
      imp_uid: imp_uid || undefined,
      paymentStatus: imp_uid ? 'completed' : 'pending'
    });

    console.log('주문 생성 성공:', order._id);

    await order.populate('items.product');
    res.status(201).json({ status: 'success', data: order });
  } catch (error) {
    console.error('주문 생성 에러:', error);
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 사용자의 주문 목록 조회
orderController.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 특정 주문 상세 조회
orderController.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.userId })
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ status: 'fail', error: 'Order not found' });
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 주문 취소
orderController.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.userId });

    if (!order) {
      return res.status(404).json({ status: 'fail', error: 'Order not found' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        status: 'fail',
        error: 'Only pending orders can be cancelled'
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();
    await order.populate('items.product');

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 관리자: 전체 주문 목록 조회
orderController.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email name')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 관리자: 주문 상태 변경
orderController.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ status: 'fail', error: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();
    await order.populate('items.product');

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = orderController;
