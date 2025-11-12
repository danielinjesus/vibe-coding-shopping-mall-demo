const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartController = {};

// 장바구니 조회
cartController.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId })
      .populate('items.product');

    if (!cart) {
      return res.status(200).json({ status: 'success', data: { items: [] } });
    }

    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 장바구니에 상품 추가
cartController.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'fail', error: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      // 장바구니 없으면 생성
      cart = await Cart.create({
        user: req.userId,
        items: [{ product: productId, quantity }]
      });
    } else {
      // 이미 장바구니에 있는 상품인지 확인
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        // 수량 증가
        existingItem.quantity += quantity;
      } else {
        // 새 상품 추가
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    await cart.populate('items.product');
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 장바구니 상품 수량 변경
cartController.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ status: 'fail', error: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ status: 'fail', error: 'Cart not found' });
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ status: 'fail', error: 'Product not in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 장바구니 상품 선택 토글
cartController.toggleSelect = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ status: 'fail', error: 'Cart not found' });
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ status: 'fail', error: 'Product not in cart' });
    }

    item.selected = !item.selected;
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 장바구니 상품 삭제
cartController.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ status: 'fail', error: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 장바구니 비우기
cartController.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ status: 'fail', error: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = cartController;
