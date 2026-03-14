const express = require('express');
const router = express.Router();
const Operation = require('../models/Operation');
const Stock = require('../models/Stock');
const Ledger = require('../models/Ledger');
const { protect } = require('../middleware/auth');

// GET all operations
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, warehouse } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (warehouse) filter.$or = [{ sourceWarehouse: warehouse }, { destinationWarehouse: warehouse }];

    const ops = await Operation.find(filter)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('lines.product', 'name sku benchmark')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(ops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create operation
router.post('/', protect, async (req, res) => {
  try {
    const op = await Operation.create({ ...req.body, createdBy: req.user._id });
    await op.populate(['sourceWarehouse', 'destinationWarehouse', 'lines.product', 'createdBy']);
    res.status(201).json(op);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET single operation
router.get('/:id', protect, async (req, res) => {
  try {
    const op = await Operation.findById(req.params.id)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('lines.product', 'name sku benchmark unitOfMeasure')
      .populate('createdBy', 'name');
    if (!op) return res.status(404).json({ message: 'Operation not found' });
    res.json(op);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update status / validate
router.put('/:id', protect, async (req, res) => {
  try {
    const op = await Operation.findById(req.params.id).populate('lines.product');
    if (!op) return res.status(404).json({ message: 'Not found' });

    const { status } = req.body;

    // Validate operation - update stock
    if (status === 'Done' && op.status !== 'Done') {
      for (const line of op.lines) {
        const { product, quantity } = line;

        if (op.type === 'Receipt') {
          // Increase stock at destination warehouse
          const whId = op.destinationWarehouse || op.sourceWarehouse;
          let stock = await Stock.findOne({ product: product._id, warehouse: whId });
          const before = stock ? stock.quantity : 0;
          if (!stock) stock = new Stock({ product: product._id, warehouse: whId, quantity: 0 });
          stock.quantity += quantity;
          await stock.save();
          await Ledger.create({ product: product._id, warehouse: whId, operation: op._id, type: 'IN', quantity, balanceBefore: before, balanceAfter: before + quantity, reference: op.referenceNo, createdBy: req.user._id });

        } else if (op.type === 'Delivery') {
          const whId = op.sourceWarehouse;
          let stock = await Stock.findOne({ product: product._id, warehouse: whId });
          if (!stock || stock.quantity < quantity)
            return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
          const before = stock.quantity;
          stock.quantity -= quantity;
          await stock.save();
          await Ledger.create({ product: product._id, warehouse: whId, operation: op._id, type: 'OUT', quantity, balanceBefore: before, balanceAfter: before - quantity, reference: op.referenceNo, createdBy: req.user._id });

        } else if (op.type === 'Transfer') {
          // Source out
          let srcStock = await Stock.findOne({ product: product._id, warehouse: op.sourceWarehouse });
          if (!srcStock || srcStock.quantity < quantity)
            return res.status(400).json({ message: `Insufficient stock for transfer: ${product.name}` });
          const srcBefore = srcStock.quantity;
          srcStock.quantity -= quantity;
          await srcStock.save();
          await Ledger.create({ product: product._id, warehouse: op.sourceWarehouse, operation: op._id, type: 'TRANSFER_OUT', quantity, balanceBefore: srcBefore, balanceAfter: srcBefore - quantity, reference: op.referenceNo, createdBy: req.user._id });

          // Dest in
          let dstStock = await Stock.findOne({ product: product._id, warehouse: op.destinationWarehouse });
          const dstBefore = dstStock ? dstStock.quantity : 0;
          if (!dstStock) dstStock = new Stock({ product: product._id, warehouse: op.destinationWarehouse, quantity: 0 });
          dstStock.quantity += quantity;
          await dstStock.save();
          await Ledger.create({ product: product._id, warehouse: op.destinationWarehouse, operation: op._id, type: 'TRANSFER_IN', quantity, balanceBefore: dstBefore, balanceAfter: dstBefore + quantity, reference: op.referenceNo, createdBy: req.user._id });

        } else if (op.type === 'Adjustment') {
          const whId = op.sourceWarehouse || op.destinationWarehouse;
          let stock = await Stock.findOne({ product: product._id, warehouse: whId });
          const before = stock ? stock.quantity : 0;
          const diff = quantity - before;
          if (!stock) stock = new Stock({ product: product._id, warehouse: whId, quantity: 0 });
          stock.quantity = quantity;
          await stock.save();
          await Ledger.create({ product: product._id, warehouse: whId, operation: op._id, type: 'ADJUST', quantity: diff, balanceBefore: before, balanceAfter: quantity, reference: op.referenceNo, notes: op.notes, createdBy: req.user._id });
        }
      }
      op.completedDate = new Date();
    }

    Object.assign(op, req.body);
    await op.save();
    await op.populate(['sourceWarehouse', 'destinationWarehouse', 'lines.product', 'createdBy']);
    res.json(op);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
