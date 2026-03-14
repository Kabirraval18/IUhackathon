import { useEffect, useState } from 'react';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { PageShell, Modal, Input, Select, Spinner, EmptyState, DataTable, LineEditor } from '../components/ui';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', category_id: '', unit_of_measure: 'pcs', reorder_qty: 0, description: '', initial_stock: '', initial_location_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/products', { params: { search: search || undefined } });
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [search]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.map(c => ({ value: c.id, label: c.name }))));
    api.get('/locations').then(r => setLocations(r.data.map(l => ({ value: l.id, label: `${l.warehouse_name} › ${l.name}` }))));
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/products', {
        ...form,
        initial_stock: Number(form.initial_stock) || undefined,
        reorder_qty: Number(form.reorder_qty),
      });
      setShowModal(false);
      setForm({ name: '', sku: '', category_id: '', unit_of_measure: 'pcs', reorder_qty: 0, description: '', initial_stock: '', initial_location_id: '' });
      load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  }

  const columns = [
    {
      key: 'name', label: 'Product',
      render: r => <span className="text-gray-200 font-medium">{r.name}</span>
    },
    {
      key: 'sku', label: 'SKU',
      render: r => <span className="font-mono text-[10px] text-lime bg-lime/5 px-2 py-1 border border-lime/20">{r.sku}</span>
    },
    { key: 'category_name', label: 'Category', render: r => r.category_name || <span className="text-fog">—</span> },
    { key: 'unit_of_measure', label: 'UOM' },
    {
      key: 'total_stock', label: 'In Stock',
      render: r => {
        const low = Number(r.total_stock) <= Number(r.reorder_qty);
        return (
          <span className={`font-mono font-bold flex items-center gap-1.5 ${low ? 'text-red-400' : 'text-lime'}`}>
            {low && <AlertTriangle size={10} />}
            {r.total_stock} <span className="text-fog font-normal">{r.unit_of_measure}</span>
          </span>
        );
      }
    },
    {
      key: 'reorder_qty', label: 'Reorder At',
      render: r => <span className="text-fog">{r.reorder_qty} {r.unit_of_measure}</span>
    },
  ];

  return (
    <PageShell
      title="Products"
      subtitle="PRODUCT CATALOG & STOCK LEVELS"
      action={
        <button onClick={() => setShowModal(true)} className="btn-lime">
          <Plus size={12} /> NEW PRODUCT
        </button>
      }
    >
      {/* Search */}
      <div className="panel border border-edge p-4 mb-4">
        <div className="flex items-center gap-3">
          <Search size={13} className="text-fog shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH BY NAME OR SKU..."
            className="bg-transparent w-full font-mono text-xs text-gray-300 placeholder-fog focus:outline-none tracking-wider"
          />
          {search && (
            <span className="mono-label text-fog">{products.length} RESULTS</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="panel border border-edge">
        {loading
          ? <Spinner />
          : products.length === 0
            ? <EmptyState
                title="No products yet"
                description="ADD YOUR FIRST PRODUCT TO INITIALIZE CATALOG"
                action={<button onClick={() => setShowModal(true)} className="btn-lime"><Plus size={12} />NEW PRODUCT</button>}
              />
            : <DataTable columns={columns} data={products} />
        }
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="NEW PRODUCT">
        <form onSubmit={save} className="space-y-5">
          {error && <div className="border border-red-900 bg-red-950/30 px-4 py-3 font-mono text-xs text-red-400">✗ {error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name *" name="name" value={form.name} onChange={handle} required placeholder="e.g. Steel Rod" />
            <Input label="SKU / Code *" name="sku" value={form.sku} onChange={handle} required placeholder="e.g. STL-001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" name="category_id" value={form.category_id} onChange={handle} options={categories} />
            <Input label="Unit of Measure" name="unit_of_measure" value={form.unit_of_measure} onChange={handle} placeholder="pcs / kg / m" />
          </div>
          <Input label="Reorder Quantity" name="reorder_qty" type="number" value={form.reorder_qty} onChange={handle} />
          <Input label="Description" name="description" value={form.description} onChange={handle} placeholder="Optional description..." />

          <div className="border-t border-edge pt-4">
            <div className="mono-label mb-3">INITIAL STOCK (OPTIONAL)</div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity" name="initial_stock" type="number" value={form.initial_stock} onChange={handle} placeholder="0" />
              <Select label="Location" name="initial_location_id" value={form.initial_location_id} onChange={handle} options={locations} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">CANCEL</button>
            <button type="submit" disabled={saving} className="btn-lime flex-1 justify-center">
              {saving ? 'SAVING...' : '→ CREATE PRODUCT'}
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
