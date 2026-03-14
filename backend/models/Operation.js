const mongoose = require('mongoose');

const operationLineSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, default: 0 },
  notes: { type: String }
});

const operationSchema = new mongoose.Schema({
  referenceNo: { type: String, unique: true },
  type: {
    type: String,
    enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'],
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'],
    default: 'Draft'
  },
  sourceWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  destinationWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  counterparty: { type: String }, // supplier or customer name
  lines: [operationLineSchema],
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate reference number
operationSchema.pre('save', async function (next) {
  if (!this.referenceNo) {
    const prefixMap = { Receipt: 'REC', Delivery: 'DEL', Transfer: 'TRF', Adjustment: 'ADJ' };
    const prefix = prefixMap[this.type] || 'OP';
    const count = await mongoose.model('Operation').countDocuments({ type: this.type });
    this.referenceNo = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Operation', operationSchema);
