const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

stockSchema.index({ product: 1, warehouse: 1 }, { unique: true });

stockSchema.virtual('availableQuantity').get(function () {
  return this.quantity - this.reservedQuantity;
});

module.exports = mongoose.model('Stock', stockSchema);
