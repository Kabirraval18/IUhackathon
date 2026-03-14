const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  operation: { type: mongoose.Schema.Types.ObjectId, ref: 'Operation' },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUST', 'TRANSFER_IN', 'TRANSFER_OUT'] },
  quantity: { type: Number, required: true },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
  reference: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ledger', ledgerSchema);
