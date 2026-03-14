const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['Terminal', 'Refinery', 'Storage Farm', 'Export Hub', 'Pipeline'],
    default: 'Terminal'
  },
  location: { type: String },
  capacity: { type: Number, default: 0 }, // in barrels
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
