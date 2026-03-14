import { useEffect, useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { PageShell, Modal, Badge, Spinner, EmptyState, DataTable, Select, Input, LineEditor } from '../components/ui';

export default function Receipts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ supplier_id: '', warehouse_id: '', scheduled_date: '', notes: '' });
  const [lines, setLines] = useState([{ product_id: '', location_id: '', qty_expected: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/receipts');
    setItems(data); setLoading(false);
  }

  useEffect(() => {
    load();
    api.get('/suppliers').then(r => setSuppliers(r.data.map(s => ({ value: s.id, label: s.name }))));
    api.get('/warehouses').then(r => setWarehouses(r.data.map(w => ({ value: w.id, label: w.name }))));
    api.get('/products').then(r => setProducts(r.data.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))));
    api.get('/locations').then(r => setLocations(r.data.map(l => ({ value: l.id, label: `${l.warehouse_name} › ${l.name}` }))));
  }, []);

  async function openDetail(row) {
    const { data } = await api.get(`/receipts/${row.id}`);
    setDetail(data);
  }

  async function validate(id) {
    try {
      await api.post(`/receipts/${id}/validate`);
      load();
      if (detail?.id === id) {
        const { data } = await api.get(`/receipts/${id}`);
        setDetail(data);
      }
    } catch (err) { alert(err.response?.data?.error || 'Validation failed'); }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/receipts', {
        ...form,
        lines: lines.filter(l => l.product_id).map(l => ({ ...l, qty_expected: Number(l.qty_expected) }))
      });
      setShowModal(false);
      setForm({ supplier_id: '', warehouse_id: '', scheduled_date: '', notes: '' });
      setLines([{ product_id: '', location_id: '', qty_expected: '' }]);
      load();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  const columns = [
    { key: 'reference', label: 'Reference', render: r => <span className="text-lime font-mono text-xs">{r.reference}</span> },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'warehouse_name', label: 'Warehouse' },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'scheduled_date', label: 'Scheduled', render: r => r.scheduled_date ? new Date(r.scheduled_date).toLocaleDateString() : '—' },
    {
      key: 'act', label: '',
      render: r => r.status !== 'done' && r.status !== 'cancelled'
        ? <button onClick={e => { e.stopPropagation(); validate(r.id); }} className="btn-ghost py-1 px-3 text-lime border-lime/30 hover:border-lime">
            <CheckCircle size={11} /> VALIDATE
          </button>
        : null
    },
  ];

  return (
    <PageShell
      title="Receipts"
      subtitle="INCOMING STOCK FROM SUPPLIERS"
      action={<button onClick={() => setShowModal(true)} className="btn-lime"><Plus size={12} />NEW RECEIPT</button>}
    >
      <div className="panel border border-edge">
        {loading ? <Spinner />
          : items.length === 0
            ? <EmptyState title="No receipts" description="CREATE A RECEIPT WHEN STOCK ARRIVES" action={<button onClick={() => setShowModal(true)} className="btn-lime"><Plus size={12} />NEW RECEIPT</button>} />
            : <DataTable columns={columns} data={items} onRow={openDetail} />
        }
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="NEW RECEIPT">
        <form onSubmit={save} className="space-y-4">
          {error && <div className="border border-red-900 bg-red-950/30 px-4 py-2 font-mono text-xs text-red-400">✗ {error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Supplier" name="supplier_id" value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))} options={suppliers} />
            <Select label="Warehouse *" name="warehouse_id" value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))} options={warehouses} required />
          </div>
          <Input label="Scheduled Date" name="scheduled_date" type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
          <Input label="Notes" name="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
          <div className="border-t border-edge pt-4">
            <LineEditor lines={lines} onChange={setLines} productOptions={products} locationOptions={locations} qtyKey="qty_expected" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">CANCEL</button>
            <button type="submit" disabled={saving} className="btn-lime flex-1 justify-center">{saving ? 'CREATING...' : '→ CREATE RECEIPT'}</button>
          </div>
        </form>
      </Modal>

      {detail && (
        <Modal open={!!detail} onClose={() => setDetail(null)} title={`RECEIPT · ${detail.reference}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge status={detail.status} />
              <span className="mono-label text-fog">{detail.supplier_name || 'NO SUPPLIER'} · {detail.warehouse_name}</span>
            </div>
            <div className="border border-edge divide-y divide-edge">
              {detail.lines?.map(l => (
                <div key={l.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-mono text-xs text-gray-200">{l.product_name}</p>
                    <p className="font-mono text-[9px] text-fog">{l.sku} · {l.location_name}</p>
                  </div>
                  <span className="font-mono text-sm text-lime font-bold">×{l.qty_expected}</span>
                </div>
              ))}
            </div>
            {detail.status !== 'done' && detail.status !== 'cancelled' && (
              <button onClick={() => validate(detail.id)} className="btn-lime w-full justify-center">
                ✓ VALIDATE RECEIPT — INCREASE STOCK
              </button>
            )}
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
