import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
    <span style={{ fontSize: '0.95rem', width: 18, textAlign: 'center' }}>{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Goodbye, ' + (user?.name || 'friend'));
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #9a7a2e, #c9a84c)',
            clipPath: 'polygon(50% 0%, 100% 40%, 80% 100%, 20% 100%, 0% 40%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '0.9rem' }}>🛢</span>
          </div>
          <div>
            <div className="brand">The OilFather</div>
            <div className="sub">IMS v1.0</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, paddingTop: 8 }}>
        <div className="nav-section-title">Main</div>
        <NavItem to="/" icon="◈" label="Dashboard" />

        <div className="nav-section-title">Inventory</div>
        <NavItem to="/products" icon="🛢" label="Products" />
        <NavItem to="/warehouses" icon="🏭" label="Warehouses" />

        <div className="nav-section-title">Operations</div>
        <NavItem to="/receipts" icon="↓" label="Receipts" />
        <NavItem to="/deliveries" icon="↑" label="Deliveries" />
        <NavItem to="/transfers" icon="⇄" label="Transfers" />
        <NavItem to="/adjustments" icon="⚖" label="Adjustments" />

        <div className="nav-section-title">Reports</div>
        <NavItem to="/ledger" icon="≡" label="Move History" />
      </nav>

      <div className="sidebar-bottom">
        <NavItem to="/profile" icon="◉" label={user?.name || 'Profile'} />
        <button onClick={handleLogout} className="nav-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ fontSize: '0.95rem', width: 18, textAlign: 'center' }}>⏻</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
