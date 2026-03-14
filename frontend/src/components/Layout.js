import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/warehouses': 'Warehouses',
  '/receipts': 'Receipts — Incoming Stock',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Stock Adjustments',
  '/ledger': 'Move History',
  '/profile': 'My Profile',
};

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'The OilFather';

  const roleColor = { admin: 'var(--gold)', manager: 'var(--blue-light)', staff: 'var(--text-muted)' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-header">
          <div className="page-title">{title}</div>
          <div className="header-actions">
            <div className="user-chip">
              <span style={{ color: roleColor[user?.role] || 'var(--text-muted)' }}>◉</span>
              <span>{user?.name}</span>
              <span style={{ opacity: 0.5, fontSize: '0.75rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em' }}>
                [{user?.role}]
              </span>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
