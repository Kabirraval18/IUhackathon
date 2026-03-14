const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  category: {
    type: String,
    enum: ['Crude Oil', 'Refined Products', 'Natural Gas', 'Petrochemicals', 'Lubricants'],
    default: 'Crude Oil'
  },
  benchmark: {
    type: String,
    enum: ['Brent', 'WTI', 'OPEC Basket', 'Dubai/Oman', 'Urals', 'Bonny Light', 'Mars Blend', 'Other'],
    default: 'Brent'
  },
  unitOfMeasure: { type: String, enum: ['Barrel', 'MT', 'KL', 'Ton'], default: 'Barrel' },
  description: { type: String },
  apiGravity: { type: Number }, // API gravity for crude quality
  sulfurContent: { type: Number }, // % sulfur content
  reorderPoint: { type: Number, default: 100 },
  maxStock: { type: Number, default: 10000 },
  currentPrice: { type: Number, default: 0 }, // USD per barrel
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);
