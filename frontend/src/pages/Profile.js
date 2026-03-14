import React from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { admin: 'Administrator', manager: 'Inventory Manager', staff: 'Warehouse Staff' };
const ROLE_COLORS = { admin: 'var(--gold)', manager: 'var(--blue-light)', staff: 'var(--text-secondary)' };

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="fade-up" style={{ maxWidth: 600 }}>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--dark-4), var(--dark-5))',
          border: '2px solid var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem'
        }}>
          👤
        </div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{user?.name}</h2>
        <p style={{ color: ROLE_COLORS[user?.role], fontFamily: 'JetBrains Mono', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {ROLE_LABELS[user?.role] || user?.role}
        </p>
        <div className="divider" style={{ marginTop: '2rem' }} />
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Email Address', value: user?.email },
            { label: 'User ID', value: user?.id },
            { label: 'Access Level', value: ROLE_LABELS[user?.role] },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{item.label}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="divider" />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
          THE OILFATHER IMS — MEMBER OF THE FAMILY
        </p>
      </div>
    </div>
  );
}
