import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const TYPE_CONFIG = {
  IN: { color: 'var(--green-light)', label: 'Receipt IN', sign: '+' },
  OUT: { color: 'var(--red-light)', label: 'Delivery OUT', sign: '-' },
  ADJUST: { color: 'var(--amber-light)', label: 'Adjustment', sign: '±' },
  TRANSFER_IN: { color: 'var(--blue-light)', label: 'Transfer IN', sign: '+' },
  TRANSFER_OUT: { color: '#af7ac5', label: 'Transfer OUT', sign: '-' },
};

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    api.get('/ledger').then(r => { setEntries(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filterType ? entries.filter(e => e.type === filterType) : entries;

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Stock Movement Ledger</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>Complete audit trail of all inventory movements</p>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All Movement Types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {filterType && <button className="btn btn-outline btn-sm" onClick={() => setFilterType('')}>Clear</button>}
        <div style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {filtered.length} entries
        </div>
      </div>

      {loading ? (
        <div className="full-loader"><div className="spinner" style={{ width: 28, height: 28 }} /><p>Loading ledger...</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Reference</th>
                <th style={{ textAlign: 'right' }}>Qty (bbl)</th>
                <th style={{ textAlign: 'right' }}>Before</th>
                <th style={{ textAlign: 'right' }}>After</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No ledger entries</td></tr>
              ) : filtered.map(e => {
                const conf = TYPE_CONFIG[e.type] || { color: 'var(--text-muted)', sign: '' };
                return (
                  <tr key={e._id}>
                    <td>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {new Date(e.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(e.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: `${conf.color}15`, color: conf.color, border: `1px solid ${conf.color}35`, borderRadius: 2, fontFamily: 'JetBrains Mono', fontSize: '0.62rem', padding: '2px 7px', letterSpacing: '0.08em' }}>
                        {e.type}
                      </span>
                    </td>
                    <td>
                      <div><strong>{e.product?.name || '—'}</strong></div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{e.product?.sku}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{e.warehouse?.name || '—'}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--gold-dark)' }}>{e.reference || '—'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: conf.color, fontWeight: 600 }}>
                      {conf.sign}{Math.abs(e.quantity)?.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {e.balanceBefore?.toLocaleString() ?? '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                      {e.balanceAfter?.toLocaleString() ?? '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{e.createdBy?.name || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
