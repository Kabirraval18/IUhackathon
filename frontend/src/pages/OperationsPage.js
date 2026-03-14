import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STATUS_COLORS = {
  Draft: 'gray', Waiting: 'amber', Ready: 'blue', Done: 'green', Canceled: 'red'
};

const STATUS_BADGE = (status) => {
  const c = STATUS_COLORS[status] || 'gray';
  return <span className={`badge badge-${c}`}>{status}</span>;
};

function OperationModal({ type, operation, products, warehouses, onClose, onSaved }) {
  const isEdit = !!operation?._id;
  const isView = operation?.status === 'Done' || operation?.status === 'Canceled';

  const [form, setForm] = useState({
    type,
    status: 'Draft',
    sourceWarehouse: warehouses[0]?._id || '',
    destinationWarehouse: warehouses[1]?._id || '',
    counterparty: '',
    scheduledDate: '',
    notes: '',
    lines: [{ product: products[0]?._id || '', quantity: 0, unitPrice: 0, notes: '' }],
    ...operation,
    lines: operation?.lines?.length ? operation.lines.map(l => ({
      product: l.product?._id || l.product,
      quantity: l.quantity,
      unitPrice: l.unitPrice || 0,
      notes: l.notes || ''
    })) : [{ product: products[0]?._id || '', quantity: 0, unitPrice: 0, notes: '' }]
  });

  const [saving, setSaving] = useState(false);

  const addLine = () => setForm(p => ({ ...p, lines: [...p.lines, { product: products[0]?._id || '', quantity: 0, unitPrice: 0, notes: '' }] }));
  const removeLine = (i) => setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i, k, v) => setForm(p => {
    const lines = [...p.lines];
    lines[i] = { ...lines[i], [k]: v };
    return { ...p, lines };
  });

  const save = async () => {
    if (!form.lines.length) return toast.error('Add at least one product');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/operations/${operation._id}`, form);
        toast.success('Operation updated');
      } else {
        await api.post('/operations', form);
        toast.success(`${type} created`);
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const validate = async () => {
    setSaving(true);
    try {
      await api.put(`/operations/${operation._id}`, { status: 'Done' });
      toast.success('Operation validated — stock updated!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Validation failed');
    } finally {
      setSaving(false);
    }
  };

  const showSource = ['Delivery', 'Transfer', 'Adjustment'].includes(type);
  const showDest = ['Receipt', 'Transfer'].includes(type);
  const showCounterparty = ['Receipt', 'Delivery'].includes(type);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{isView ? 'View' : isEdit ? 'Edit' : 'New'} {type}</div>
            {operation?.referenceNo && (
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--gold)', marginTop: 2 }}>{operation.referenceNo}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {operation?.status && STATUS_BADGE(operation.status)}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="form-row">
            {showCounterparty && (
              <div className="form-group">
                <label className="form-label">{type === 'Receipt' ? 'Supplier' : 'Customer'}</label>
                <input className="form-input" value={form.counterparty} onChange={e => setForm(p => ({ ...p, counterparty: e.target.value }))} disabled={isView} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input type="date" className="form-input" value={form.scheduledDate?.slice(0, 10) || ''} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} disabled={isView} />
            </div>
          </div>
          <div className="form-row">
            {showSource && (
              <div className="form-group">
                <label className="form-label">Source Warehouse</label>
                <select className="form-select" value={form.sourceWarehouse} onChange={e => setForm(p => ({ ...p, sourceWarehouse: e.target.value }))} disabled={isView}>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
            )}
            {showDest && (
              <div className="form-group">
                <label className="form-label">{type === 'Receipt' ? 'Receiving Warehouse' : 'Destination Warehouse'}</label>
                <select className="form-select" value={form.destinationWarehouse} onChange={e => setForm(p => ({ ...p, destinationWarehouse: e.target.value }))} disabled={isView}>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Lines */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Products</label>
              {!isView && <button className="btn btn-outline btn-sm" onClick={addLine}>＋ Add Line</button>}
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {form.lines.map((line, i) => {
                const prod = products.find(p => p._id === line.product || p._id === line.product?._id);
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, padding: '10px 12px', background: i % 2 === 0 ? 'var(--dark-3)' : 'transparent', borderBottom: i < form.lines.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                    <select className="form-select" value={line.product} onChange={e => updateLine(i, 'product', e.target.value)} disabled={isView} style={{ fontSize: '0.88rem', padding: '6px 8px' }}>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input type="number" className="form-input" placeholder="Qty" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} disabled={isView} style={{ fontSize: '0.88rem', padding: '6px 8px' }} />
                    <input type="number" className="form-input" placeholder="Unit Price" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))} disabled={isView} style={{ fontSize: '0.88rem', padding: '6px 8px' }} />
                    {!isView && (
                      <button onClick={() => removeLine(i)} style={{ background: 'none', border: 'none', color: 'var(--red-light)', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>✕</button>
                    )}
                    {isView && prod && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{prod.unitOfMeasure}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} disabled={isView} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          {!isView && !isEdit && <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner" /> : `Create ${type}`}</button>}
          {!isView && isEdit && <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner" /> : 'Save Changes'}</button>}
          {isEdit && !isView && operation?.status !== 'Done' && (
            <button className="btn btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }} onClick={validate} disabled={saving}>
              {saving ? <span className="spinner" /> : '✓ Validate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OperationsPage({ type }) {
  const [ops, setOps] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [oRes, pRes, wRes] = await Promise.all([
        api.get(`/operations?type=${type}`),
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setOps(oRes.data);
      setProducts(pRes.data);
      setWarehouses(wRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [type]);

  const filtered = filterStatus ? ops.filter(o => o.status === filterStatus) : ops;

  const warehouseName = (wh) => wh?.name || '—';

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>{type} Operations</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>{ops.length} total {type.toLowerCase()}s</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>＋ New {type}</button>
      </div>

      <div className="filter-bar">
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Statuses</option>
          {['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'].map(s => <option key={s}>{s}</option>)}
        </select>
        {filterStatus && <button className="btn btn-outline btn-sm" onClick={() => setFilterStatus('')}>Clear</button>}
      </div>

      {loading ? (
        <div className="full-loader"><div className="spinner" style={{ width: 28, height: 28 }} /><p>Loading...</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>{type === 'Receipt' ? 'Supplier' : type === 'Delivery' ? 'Customer' : 'From'}</th>
                {(type === 'Transfer') && <th>To</th>}
                <th>Products</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No {type.toLowerCase()}s found</td></tr>
              ) : filtered.map(op => (
                <tr key={op._id}>
                  <td>
                    <strong style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'var(--gold)' }}>{op.referenceNo}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(op.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{op.counterparty || warehouseName(op.sourceWarehouse) || '—'}</td>
                  {type === 'Transfer' && <td>{warehouseName(op.destinationWarehouse)}</td>}
                  <td>
                    {op.lines?.slice(0, 2).map((l, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {l.product?.name || '?'} × {l.quantity?.toLocaleString()}
                      </div>
                    ))}
                    {op.lines?.length > 2 && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{op.lines.length - 2} more</div>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {op.scheduledDate ? new Date(op.scheduledDate).toLocaleDateString() : '—'}
                  </td>
                  <td>{STATUS_BADGE(op.status)}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setModal(op)}>
                      {op.status === 'Done' || op.status === 'Canceled' ? 'View' : 'Open'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <OperationModal
          type={type}
          operation={modal === 'new' ? null : modal}
          products={products}
          warehouses={warehouses}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
