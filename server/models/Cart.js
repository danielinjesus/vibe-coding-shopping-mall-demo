const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  selected: {
    type: Boolean,
    default: true
  }
}, {
  _id: false
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

// 장바구니 총액 계산 메서드
cartSchema.methods.getTotalPrice = async function() {
  await this.populate('items.product');
  return this.items.reduce((total, item) => {
    if (item.selected && item.product) {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0);
};

// 선택된 상품 개수
cartSchema.methods.getSelectedCount = function() {
  return this.items.filter(item => item.selected).length;
};

module.exports = mongoose.model('Cart', cartSchema);
