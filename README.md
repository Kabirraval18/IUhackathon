# 🛢 The OilFather — Inventory Management System

> *"I'm gonna make you an offer you cannot refuse."*
> A premium crude oil inventory management system for benchmarks: Brent, WTI, OPEC, Dubai, Urals, Bonny Light, Mars Blend & more.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + OTP email verification |
| Styling | Custom CSS (dark luxury aesthetic) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/oilfather
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# For OTP emails (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password   # Use Gmail App Password (not regular password)

FRONTEND_URL=http://localhost:3000
```

> **Note**: For Gmail, enable 2FA and generate an App Password at https://myaccount.google.com/apppasswords

> **Dev Mode**: If email is not configured, OTPs are printed to the backend console and returned in the API response as `devOtp`.

### 3. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm start
# OR for development with auto-reload:
npm run dev   # requires: npm install -g nodemon
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## 🔐 Demo Login

After first start, seed data is auto-created:

| Field | Value |
|-------|-------|
| Email | admin@oilfather.com |
| Password | Admin@123 |
| Role | Administrator |

---

## 📊 Features

### Authentication
- ✅ Signup with email + OTP verification (6-digit)
- ✅ Login with JWT
- ✅ OTP-based password reset
- ✅ Role-based access (Admin, Manager, Staff)

### Dashboard
- ✅ KPI cards: Total Products, Low Stock, Out of Stock, Pending Receipts, Deliveries, Transfers
- ✅ Bar chart: Stock by Benchmark
- ✅ Pie chart: Benchmark distribution
- ✅ Recent activity feed
- ✅ Low stock alerts with progress bars

### Products
- ✅ 8 crude oil benchmarks: Brent, WTI, OPEC Basket, Dubai/Oman, Urals, Bonny Light, Mars Blend
- ✅ API gravity & sulfur content tracking
- ✅ Reorder point alerts
- ✅ Multi-warehouse stock view
- ✅ SKU search & benchmark filter

### Operations
- ✅ **Receipts** — Incoming stock from suppliers (increases stock on validate)
- ✅ **Deliveries** — Outgoing stock to customers (decreases stock on validate)
- ✅ **Internal Transfers** — Move stock between warehouses
- ✅ **Adjustments** — Fix physical count discrepancies
- ✅ Status flow: Draft → Waiting → Ready → Done / Canceled
- ✅ Auto-generated reference numbers (REC-00001, DEL-00001, etc.)

### Warehouses
- ✅ Types: Terminal, Refinery, Storage Farm, Export Hub, Pipeline
- ✅ Capacity tracking
- ✅ Multi-warehouse stock management

### Stock Ledger
- ✅ Complete audit trail of every movement
- ✅ Balance before/after for every entry
- ✅ Filter by movement type

---

## 🛢 Auto-Seeded Crude Grades

| Product | Benchmark | API° | Sulfur% | Price |
|---------|-----------|------|---------|-------|
| Brent Crude | Brent | 38.3 | 0.37% | $82.45 |
| West Texas Intermediate | WTI | 39.6 | 0.24% | $78.90 |
| Dubai Crude | Dubai/Oman | 31.0 | 2.0% | $80.10 |
| OPEC Basket Blend | OPEC Basket | 32.7 | 1.77% | $81.20 |
| Urals Heavy | Urals | 31.7 | 1.35% | $69.50 |
| Bonny Light | Bonny Light | 35.4 | 0.14% | $83.70 |
| Mars Sour Blend | Mars Blend | 28.0 | 2.1% | $76.30 |
| Oman Crude | Dubai/Oman | 33.0 | 1.09% | $80.80 |

---

## 📁 Project Structure

```
oilfather/
├── backend/
│   ├── models/         # Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Warehouse.js
│   │   ├── Stock.js
│   │   ├── Operation.js
│   │   └── Ledger.js
│   ├── routes/         # Express API routes
│   │   ├── auth.js     # Signup, login, OTP, reset
│   │   ├── products.js
│   │   ├── operations.js
│   │   ├── warehouses.js
│   │   ├── dashboard.js
│   │   └── ledger.js
│   ├── middleware/
│   │   └── auth.js     # JWT protect middleware
│   ├── utils/
│   │   └── otp.js      # OTP generation & email
│   └── server.js       # Main server + seed data
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.js
        │   └── Sidebar.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Dashboard.js
        │   ├── Login.js
        │   ├── Signup.js
        │   ├── ForgotPassword.js
        │   ├── Products.js
        │   ├── Warehouses.js
        │   ├── OperationsPage.js  # Shared: Receipts/Deliveries/Transfers/Adjustments
        │   ├── Ledger.js
        │   └── Profile.js
        ├── utils/
        │   └── api.js
        ├── App.js
        └── index.css
```

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/signup          — Create account
POST /api/auth/verify-otp      — Verify email OTP
POST /api/auth/resend-otp      — Resend verification OTP
POST /api/auth/login           — Login
POST /api/auth/forgot-password — Send reset OTP
POST /api/auth/reset-password  — Reset with OTP
GET  /api/auth/me              — Get current user
```

### Products
```
GET    /api/products           — List all (with stock)
POST   /api/products           — Create product
GET    /api/products/:id       — Product + stock + ledger
PUT    /api/products/:id       — Update product
DELETE /api/products/:id       — Archive product
```

### Operations
```
GET  /api/operations           — List operations (filter: type, status)
POST /api/operations           — Create operation
GET  /api/operations/:id       — Get operation
PUT  /api/operations/:id       — Update / validate (status=Done triggers stock update)
```

### Warehouses
```
GET  /api/warehouses           — List warehouses
POST /api/warehouses           — Create warehouse
PUT  /api/warehouses/:id       — Update warehouse
```

### Dashboard & Ledger
```
GET /api/dashboard/stats       — KPIs & chart data
GET /api/ledger                — Stock movement history
```

---

*The OilFather IMS — Every barrel, accounted for.*
