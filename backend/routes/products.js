const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Warehouse = require('../models/Warehouse');
const Ledger = require('../models/Ledger');
const { protect } = require('../middleware/auth');

// GET all products
router.get('/', protect, async (req, res) => {
  try {
    const { category, benchmark, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (benchmark) filter.benchmark = benchmark;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { sku: new RegExp(search, 'i') }
    ];

    const products = await Product.find(filter).populate('createdBy', 'name');

    // Get stock info for each product
    const productsWithStock = await Promise.all(products.map(async (p) => {
      const stocks = await Stock.find({ product: p._id }).populate('warehouse', 'name code');
      const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);
      return {
        ...p.toObject(),
        totalStock,
        stockByWarehouse: stocks
      };
    }));

    res.json(productsWithStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product
router.post('/', protect, async (req, res) => {
  try {
    const { name, sku, category, benchmark, unitOfMeasure, description,
            apiGravity, sulfurContent, reorderPoint, maxStock, currentPrice, initialStock, warehouseId } = req.body;

    const product = await Product.create({
      name, sku, category, benchmark, unitOfMeasure, description,
      apiGravity, sulfurContent, reorderPoint, maxStock, currentPrice,
      createdBy: req.user._id
    });

    // Create initial stock if provided
    if (initialStock && warehouseId) {
      const warehouse = await Warehouse.findById(warehouseId);
      if (warehouse) {
        await Stock.create({ product: product._id, warehouse: warehouseId, quantity: initialStock });
        await Ledger.create({
          product: product._id,
          warehouse: warehouseId,
          type: 'IN',
          quantity: initialStock,
          balanceBefore: 0,
          balanceAfter: initialStock,
          reference: 'INITIAL',
          notes: 'Initial stock entry',
          createdBy: req.user._id
        });
      }
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET single product
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const stocks = await Stock.find({ product: product._id }).populate('warehouse', 'name code');
    const ledger = await Ledger.find({ product: product._id })
      .populate('warehouse', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ ...product.toObject(), stocks, ledger });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update product
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product
router.delete('/:id', protect, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product archived' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
