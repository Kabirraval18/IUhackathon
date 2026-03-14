require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/operations', require('./routes/operations'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ledger', require('./routes/ledger'));

app.get('/api/health', (req, res) => res.json({ status: 'The OilFather is alive' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oilfather';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedData();
    app.listen(PORT, () => console.log(`OilFather backend running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Seed initial data
async function seedData() {
  const Warehouse = require('./models/Warehouse');
  const Product = require('./models/Product');
  const Stock = require('./models/Stock');
  const User = require('./models/User');

  const whCount = await Warehouse.countDocuments();
  if (whCount === 0) {
    const warehouses = await Warehouse.insertMany([
      { name: 'North Sea Terminal', code: 'NST', type: 'Terminal', location: 'Aberdeen, UK', capacity: 500000 },
      { name: 'Middle East Hub', code: 'MEH', type: 'Export Hub', location: 'Dubai, UAE', capacity: 1000000 },
      { name: 'Gulf Coast Refinery', code: 'GCR', type: 'Refinery', location: 'Houston, TX', capacity: 750000 },
      { name: 'Singapore Storage Farm', code: 'SSF', type: 'Storage Farm', location: 'Singapore', capacity: 600000 }
    ]);

    const products = await Product.insertMany([
      { name: 'Brent Crude', sku: 'BRT-001', category: 'Crude Oil', benchmark: 'Brent', unitOfMeasure: 'Barrel', apiGravity: 38.3, sulfurContent: 0.37, reorderPoint: 5000, maxStock: 100000, currentPrice: 82.45, description: 'North Sea sweet light crude' },
      { name: 'West Texas Intermediate', sku: 'WTI-001', category: 'Crude Oil', benchmark: 'WTI', unitOfMeasure: 'Barrel', apiGravity: 39.6, sulfurContent: 0.24, reorderPoint: 5000, maxStock: 100000, currentPrice: 78.90, description: 'US benchmark sweet crude' },
      { name: 'Dubai Crude', sku: 'DXB-001', category: 'Crude Oil', benchmark: 'Dubai/Oman', unitOfMeasure: 'Barrel', apiGravity: 31.0, sulfurContent: 2.0, reorderPoint: 3000, maxStock: 80000, currentPrice: 80.10, description: 'Middle East medium sour crude' },
      { name: 'OPEC Basket Blend', sku: 'OPC-001', category: 'Crude Oil', benchmark: 'OPEC Basket', unitOfMeasure: 'Barrel', apiGravity: 32.7, sulfurContent: 1.77, reorderPoint: 4000, maxStock: 90000, currentPrice: 81.20, description: 'Weighted average of OPEC crude exports' },
      { name: 'Urals Heavy', sku: 'URL-001', category: 'Crude Oil', benchmark: 'Urals', unitOfMeasure: 'Barrel', apiGravity: 31.7, sulfurContent: 1.35, reorderPoint: 2000, maxStock: 60000, currentPrice: 69.50, description: 'Russian export blend crude' },
      { name: 'Bonny Light', sku: 'BNL-001', category: 'Crude Oil', benchmark: 'Bonny Light', unitOfMeasure: 'Barrel', apiGravity: 35.4, sulfurContent: 0.14, reorderPoint: 2000, maxStock: 50000, currentPrice: 83.70, description: 'Nigerian sweet light crude' },
      { name: 'Mars Sour Blend', sku: 'MRS-001', category: 'Crude Oil', benchmark: 'Mars Blend', unitOfMeasure: 'Barrel', apiGravity: 28.0, sulfurContent: 2.1, reorderPoint: 1500, maxStock: 40000, currentPrice: 76.30, description: 'Gulf of Mexico heavy sour crude' },
      { name: 'Oman Crude', sku: 'OMN-001', category: 'Crude Oil', benchmark: 'Dubai/Oman', unitOfMeasure: 'Barrel', apiGravity: 33.0, sulfurContent: 1.09, reorderPoint: 2500, maxStock: 70000, currentPrice: 80.80, description: 'Sultanate of Oman export crude' }
    ]);

    // Seed stock levels
    for (const product of products) {
      for (const wh of warehouses) {
        const qty = Math.floor(Math.random() * 20000) + 1000;
        await Stock.create({ product: product._id, warehouse: wh._id, quantity: qty });
      }
    }

    console.log('Seed data created: warehouses, products, stock levels');
  }

  // Create demo admin user
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({
      name: 'Don Corleone',
      email: 'admin@oilfather.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true
    });
    console.log('Demo admin: admin@oilfather.com / Admin@123');
  }
}
