const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Operation = require('../models/Operation');
const Ledger = require('../models/Ledger');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalProducts,
      operations,
      stocks,
      recentLedger
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Operation.find({}).lean(),
      Stock.find({}).populate('product', 'reorderPoint name sku benchmark'),
      Ledger.find({}).sort({ createdAt: -1 }).limit(10)
        .populate('product', 'name sku')
        .populate('warehouse', 'name')
    ]);

    const lowStockItems = stocks.filter(s =>
      s.product && s.quantity <= (s.product.reorderPoint || 100) && s.quantity > 0
    );
    const outOfStockItems = stocks.filter(s => s.quantity === 0);

    const pendingReceipts = operations.filter(o => o.type === 'Receipt' && ['Draft', 'Waiting', 'Ready'].includes(o.status)).length;
    const pendingDeliveries = operations.filter(o => o.type === 'Delivery' && ['Draft', 'Waiting', 'Ready'].includes(o.status)).length;
    const scheduledTransfers = operations.filter(o => o.type === 'Transfer' && ['Draft', 'Waiting', 'Ready'].includes(o.status)).length;

    // Stock by benchmark
    const stockByBenchmark = {};
    for (const s of stocks) {
      if (s.product?.benchmark) {
        stockByBenchmark[s.product.benchmark] = (stockByBenchmark[s.product.benchmark] || 0) + s.quantity;
      }
    }

    res.json({
      totalProducts,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      stockByBenchmark,
      recentActivity: recentLedger,
      lowStockItems: lowStockItems.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
