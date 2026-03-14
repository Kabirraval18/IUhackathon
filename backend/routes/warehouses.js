const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true });
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const wh = await Warehouse.create(req.body);
    res.status(201).json(wh);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const wh = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(wh);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
