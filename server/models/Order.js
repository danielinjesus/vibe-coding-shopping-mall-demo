const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],

  // 배송 정보
  shippingAddress: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  recipientPhone: {
    type: String,
    required: true
  },

  // 결제 정보
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'transfer', 'cash']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  imp_uid: {
    type: String,
    sparse: true
  },

  // 주문 상태
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// 주문번호 자동 생성
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
