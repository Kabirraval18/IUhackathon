import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import OperationsPage from './pages/OperationsPage';
import Ledger from './pages/Ledger';
import Profile from './pages/Profile';
import './index.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="receipts" element={<OperationsPage type="Receipt" />} />
        <Route path="deliveries" element={<OperationsPage type="Delivery" />} />
        <Route path="transfers" element={<OperationsPage type="Transfer" />} />
        <Route path="adjustments" element={<OperationsPage type="Adjustment" />} />
        <Route path="ledger" element={<Ledger />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1c2738',
              color: '#e8dcc8',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '4px',
              fontFamily: '"Crimson Pro", serif',
              fontSize: '0.95rem',
            },
            success: { iconTheme: { primary: '#27ae60', secondary: '#1c2738' } },
            error: { iconTheme: { primary: '#e74c3c', secondary: '#1c2738' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
