import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const BENCHMARKS = ['Brent', 'WTI', 'OPEC Basket', 'Dubai/Oman', 'Urals', 'Bonny Light', 'Mars Blend', 'Other'];
const CATEGORIES = ['Crude Oil', 'Refined Products', 'Natural Gas', 'Petrochemicals', 'Lubricants'];
const UOM = ['Barrel', 'MT', 'KL', 'Ton'];

const BM_COLORS = { 'Brent': '#5dade2', 'WTI': '#58d68d', 'OPEC Basket': '#c9a84c', 'Dubai/Oman': '#eb984e', 'Urals': '#af7ac5', 'Bonny Light': '#45b39d', 'Mars Blend': '#ec7063', 'Other': '#888' };

function ProductModal({ product, warehouses, onClose, onSaved }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: '', sku: '', category: 'Crude Oil', benchmark: 'Brent', unitOfMeasure: 'Barrel',
    description: '', apiGravity: '', sulfurContent: '', reorderPoint: 500, maxStock: 50000, currentPrice: 0,
    initialStock: '', warehouseId: warehouses[0]?._id || '',
    ...product
  });
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name || !form.sku) return toast.error('Name and SKU required');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/products/${product._id}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Product' : 'New Crude Grade'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Brent Crude" />
            </div>
            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input className="form-input" value={form.sku} onChange={e => f('sku', e.target.value.toUpperCase())} placeholder="BRT-001" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Benchmark</label>
              <select className="form-select" value={form.benchmark} onChange={e => f('benchmark', e.target.value)}>
                {BENCHMARKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => f('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select className="form-select" value={form.unitOfMeasure} onChange={e => f('unitOfMeasure', e.target.value)}>
                {UOM.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">API Gravity (°)</label>
              <input type="number" className="form-input" value={form.apiGravity} onChange={e => f('apiGravity', e.target.value)} placeholder="38.3" />
            </div>
            <div className="form-group">
              <label className="form-label">Sulfur Content (%)</label>
              <input type="number" className="form-input" value={form.sulfurContent} onChange={e => f('sulfurContent', e.target.value)} placeholder="0.37" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Reorder Point (bbl)</label>
              <input type="number" className="form-input" value={form.reorderPoint} onChange={e => f('reorderPoint', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Price (USD/bbl)</label>
              <input type="number" className="form-input" value={form.currentPrice} onChange={e => f('currentPrice', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={e => f('description', e.target.value)} />
          </div>
          {!isEdit && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Initial Stock (optional)</label>
                <input type="number" className="form-input" value={form.initialStock} onChange={e => f('initialStock', e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">At Warehouse</label>
                <select className="form-select" value={form.warehouseId} onChange={e => f('warehouseId', e.target.value)}>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <span className="spinner" /> : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBenchmark, setFilterBenchmark] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | product object

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, wRes] = await Promise.all([api.get('/products'), api.get('/warehouses')]);
      setProducts(pRes.data);
      setWarehouses(wRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchBm = !filterBenchmark || p.benchmark === filterBenchmark;
    return matchSearch && matchBm;
  });

  const stockHealth = (product) => {
    if (product.totalStock === 0) return { color: 'var(--red-light)', label: 'Out of Stock' };
    if (product.totalStock <= product.reorderPoint) return { color: 'var(--amber-light)', label: 'Low Stock' };
    return { color: 'var(--green-light)', label: 'In Stock' };
  };

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Crude Grades & Products</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>{products.length} products registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>＋ New Product</button>
      </div>

      <div className="filter-bar">
        <input className="form-input" placeholder="🔍 Search name or SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-select" value={filterBenchmark} onChange={e => setFilterBenchmark(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All Benchmarks</option>
          {BENCHMARKS.map(b => <option key={b}>{b}</option>)}
        </select>
        {(search || filterBenchmark) && (
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setFilterBenchmark(''); }}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="full-loader"><div className="spinner" style={{ width: 28, height: 28 }} /><p>Loading products...</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Benchmark</th>
                <th>API°</th>
                <th>Sulfur %</th>
                <th>Price (USD/bbl)</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No products found</td></tr>
              ) : filtered.map(p => {
                const health = stockHealth(p);
                return (
                  <tr key={p._id}>
                    <td>
                      <div><strong>{p.name}</strong></div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.sku}</div>
                    </td>
                    <td>
                      <span style={{ color: BM_COLORS[p.benchmark] || 'var(--text-secondary)', fontWeight: 600 }}>
                        {p.benchmark}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>{p.apiGravity ?? '—'}°</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>{p.sulfurContent ?? '—'}%</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'var(--gold)' }}>
                      ${Number(p.currentPrice || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>
                      {(p.totalStock || 0).toLocaleString()} {p.unitOfMeasure}
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${health.color}18`, color: health.color, border: `1px solid ${health.color}40` }}>
                        {health.label}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(p)}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          warehouses={warehouses}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
