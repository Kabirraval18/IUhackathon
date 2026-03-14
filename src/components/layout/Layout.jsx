import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, ClipboardList, History, Settings, LogOut, Sun, Moon
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Package, label: 'Products' },
  { divider: 'Operations' },
  { to: '/receipts', icon: ArrowDownToLine, label: 'Receipts' },
  { to: '/deliveries', icon: ArrowUpFromLine, label: 'Deliveries' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/adjustments', icon: ClipboardList, label: 'Adjustments' },
  { divider: 'System' },
  { to: '/history', icon: History, label: 'Move History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--lime)', fontVariantNumeric: 'tabular-nums' }}>
      {time.toTimeString().slice(0, 8)}
    </span>
  );
}

function ThemeToggle() {
  const { theme, toggle, isDark } = useTheme();
  const [switching, setSwitching] = useState(false);

  function handleToggle() {
    setSwitching(true);
    toggle();
    setTimeout(() => setSwitching(false), 400);
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        marginTop: 4,
      }}
      onClick={handleToggle}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--lime)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ color: 'var(--text-fog)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}>
          {isDark
            ? <Sun size={12} style={{ color: 'var(--lime)' }} />
            : <Moon size={12} style={{ color: 'var(--lime)' }} />
          }
        </div>
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: 9,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--text-fog)',
        }}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </div>
      {/* Toggle switch */}
      <div className={`theme-toggle ${!isDark ? 'active' : ''}`} style={{ pointerEvents: 'none' }}>
        <div className="theme-toggle-knob" />
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden', transition: 'background 0.35s' }}>
      {/* Scanline - dark only */}
      {isDark && <div className="scanline" />}

      {/* Sidebar */}
      <aside style={{
        width: 220, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-ink)', borderRight: '1px solid var(--border)',
        flexShrink: 0, position: 'relative', zIndex: 10,
        transition: 'background 0.35s, border-color 0.35s',
      }}>
        {/* Brand */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div className="live-dot" />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--lime)' }}>
              LIVE SYSTEM
            </span>
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 2, transition: 'color 0.35s' }}>
            The Oilfather
          </div>
          <Clock />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {nav.map((item, i) =>
            item.divider ? (
              <div key={i} style={{ padding: '14px 8px 6px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-fog)' }}>
                  {item.divider}
                </span>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', marginBottom: 1,
                  fontFamily: 'JetBrains Mono', fontSize: 10,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderLeft: `2px solid ${isActive ? 'var(--lime)' : 'transparent'}`,
                  paddingLeft: isActive ? 8 : 10,
                  color: isActive ? 'var(--lime)' : 'var(--text-fog)',
                  background: isActive ? 'var(--lime-muted)' : 'transparent',
                  transition: 'all 0.15s',
                })}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                onMouseLeave={e => { }}
              >
                <item.icon size={12} />
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Bottom section: theme toggle + user */}
        <div style={{ borderTop: '1px solid var(--border)', padding: 12 }}>
          <ThemeToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '6px 4px' }}>
            <div style={{
              width: 28, height: 28,
              border: '1px solid rgba(185,255,75,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--lime)', flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-fog)' }}>
                {user?.role}
              </p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              style={{ color: 'var(--text-fog)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-fog)'}
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-void)', position: 'relative', transition: 'background 0.35s' }}>
        <div className="bg-grid-theme" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
