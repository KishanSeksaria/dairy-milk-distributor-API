const mongoose = require('../db');

const orderSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  orderedOn: {
    type: String,
    default: new Date().toLocaleDateString(),
  },
  status: {
    type: String,
    enum: ['placed', 'packed', 'dispached', 'delivered'],
    default: 'placed',
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
