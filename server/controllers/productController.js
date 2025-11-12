const Product = require('../models/Product');

const productController = {};

// 상품 생성
productController.createProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description } = req.body;
    const product = await Product.create({ sku, name, price, category, image, description });
    res.status(201).json({ status: 'success', data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'fail', error: 'SKU already exists' });
    }
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 모든 상품 조회 (페이지네이션)
productController.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const totalCount = await Product.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 단일 상품 조회
productController.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: 'fail', error: 'Product not found' });
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 상품 수정
productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ status: 'fail', error: 'Product not found' });
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'fail', error: 'SKU already exists' });
    }
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 상품 삭제
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ status: 'fail', error: 'Product not found' });
    }
    res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = productController;
