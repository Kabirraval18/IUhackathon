const express = require('express');
const router = express.Router();
const Ledger = require('../models/Ledger');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { product, warehouse, type } = req.query;
    const filter = {};
    if (product) filter.product = product;
    if (warehouse) filter.warehouse = warehouse;
    if (type) filter.type = type;

    const ledger = await Ledger.find(filter)
      .populate('product', 'name sku benchmark')
      .populate('warehouse', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(ledger);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
