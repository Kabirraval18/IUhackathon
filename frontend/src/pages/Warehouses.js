import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TYPES = ['Terminal', 'Refinery', 'Storage Farm', 'Export Hub', 'Pipeline'];

function WarehouseModal({ warehouse, onClose, onSaved }) {
  const isEdit = !!warehouse?._id;
  const [form, setForm] = useState({ name: '', code: '', type: 'Terminal', location: '', capacity: 500000, ...warehouse });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name || !form.code) return toast.error('Name and Code required');
    setSaving(true);
    try {
      if (isEdit) await api.put(`/warehouses/${warehouse._id}`, form);
      else await api.post('/warehouses', form);
      toast.success(`Warehouse ${isEdit ? 'updated' : 'created'}`);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Warehouse' : 'New Warehouse'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="North Sea Terminal" />
            </div>
            <div className="form-group">
              <label className="form-label">Code *</label>
              <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="NST" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (barrels)</label>
              <input type="number" className="form-input" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Aberdeen, UK" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner" /> : (isEdit ? 'Update' : 'Create Warehouse')}</button>
        </div>
      </div>
    </div>
  );
}

const TYPE_ICONS = { Terminal: '⚓', Refinery: '🏭', 'Storage Farm': '🛢', 'Export Hub': '🚢', Pipeline: '〰' };

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/warehouses');
      setWarehouses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Warehouses & Terminals</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>{warehouses.length} locations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>＋ New Warehouse</button>
      </div>

      {loading ? (
        <div className="full-loader"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {warehouses.map(wh => (
            <div key={wh._id} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setModal(wh)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--dark-4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', border: '1px solid var(--border)' }}>
                    {TYPE_ICONS[wh.type] || '🏭'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-primary)' }}>{wh.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.12em' }}>{wh.code}</div>
                  </div>
                </div>
                <span className="badge badge-gold">{wh.type}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 2 }}>LOCATION</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{wh.location || '—'}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 2 }}>CAPACITY</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{(wh.capacity || 0).toLocaleString()} bbl</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <WarehouseModal warehouse={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetch(); }} />
      )}
    </div>
  );
}
