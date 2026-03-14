import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { PageShell, Badge, Spinner, DataTable, Input, Select } from '../components/ui';

/* ══════════════════════════════════════════════
   MOVE HISTORY
══════════════════════════════════════════════ */
export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ operation_type: '', from_date: '', to_date: '' });

  async function load() {
    setLoading(true);
    const { data } = await api.get('/history', { params: filters });
    setHistory(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filters]);

  const handle = e => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

  const opTypes = ['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment', 'initial']
    .map(v => ({ value: v, label: v.replace(/_/g, ' ').toUpperCase() }));

  const columns = [
    {
      key: 'created_at', label: 'Timestamp',
      render: r => (
        <span className="font-mono text-[10px] text-fog tabular-nums">
          {new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )
    },
    {
      key: 'product_name', label: 'Product',
      render: r => (
        <div>
          <span className="text-gray-200 text-xs">{r.product_name}</span>
          <span className="text-fog text-[9px] ml-2">{r.sku}</span>
        </div>
      )
    },
    {
      key: 'location_name', label: 'Location',
      render: r => (
        <span className="font-mono text-[10px] text-fog">
          {r.warehouse_name} › {r.location_name}
        </span>
      )
    },
    { key: 'operation_type', label: 'Type', render: r => <Badge status={r.operation_type} /> },
    {
      key: 'qty_change', label: 'Qty Change',
      render: r => (
        <span className={`font-mono font-bold text-sm ${Number(r.qty_change) > 0 ? 'text-lime' : 'text-red-400'}`}>
          {Number(r.qty_change) > 0 ? '+' : ''}{r.qty_change}
        </span>
      )
    },
    {
      key: 'user_name', label: 'Operator',
      render: r => <span className="font-mono text-[10px] text-fog">{r.user_name || '—'}</span>
    },
  ];

  return (
    <PageShell title="Move History" subtitle="FULL STOCK LEDGER AUDIT TRAIL">
      {/* Filters */}
      <div className="panel border border-edge p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="mono-label mb-0 self-center">FILTER:</div>
          <div className="w-44">
            <select
              name="operation_type"
              value={filters.operation_type}
              onChange={handle}
              className="input text-xs"
            >
              <option value="">ALL TYPES</option>
              {opTypes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="w-40">
            <input
              name="from_date" type="date" value={filters.from_date}
              onChange={handle} className="input text-xs"
            />
          </div>
          <div className="w-40">
            <input
              name="to_date" type="date" value={filters.to_date}
              onChange={handle} className="input text-xs"
            />
          </div>
          <button
            onClick={() => setFilters({ operation_type: '', from_date: '', to_date: '' })}
            className="btn-ghost text-[9px] px-3 py-2"
          >
            CLEAR
          </button>
          <div className="ml-auto mono-label text-fog">
            {history.length} RECORDS
          </div>
        </div>
      </div>

      <div className="panel border border-edge">
        {loading
          ? <Spinner />
          : history.length === 0
            ? (
              <div className="flex items-center justify-center py-16">
                <span className="mono-label text-fog">NO LEDGER ENTRIES MATCH FILTERS</span>
              </div>
            )
            : <DataTable columns={columns} data={history} />
        }
      </div>
    </PageShell>
  );
}

/* ══════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════ */
export function SettingsPage() {
  const [data, setData] = useState({ warehouses: [], locations: [], categories: [], suppliers: [] });
  const [forms, setForms] = useState({
    warehouse: { name: '', address: '' },
    location: { warehouse_id: '', name: '', type: 'shelf' },
    category: { name: '' },
    supplier: { name: '', contact: '', email: '' },
  });

  async function load() {
    const [w, l, c, s] = await Promise.all([
      api.get('/warehouses'), api.get('/locations'),
      api.get('/categories'), api.get('/suppliers'),
    ]);
    setData({ warehouses: w.data, locations: l.data, categories: c.data, suppliers: s.data });
  }

  useEffect(() => { load(); }, []);

  function updateForm(section, field, value) {
    setForms(f => ({ ...f, [section]: { ...f[section], [field]: value } }));
  }

  async function submit(section, endpoint, resetFields) {
    try {
      await api.post(`/${endpoint}`, forms[section]);
      setForms(f => ({ ...f, [section]: resetFields }));
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
  }

  function ConfigSection({ title, tag, items, renderItem, formContent, onSubmit }) {
    return (
      <div className="panel border border-edge">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-edge">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime" />
            <span className="mono-label">{title}</span>
          </div>
          <span className="font-mono text-[9px] text-fog">{items.length} ENTRIES</span>
        </div>

        {/* Items list */}
        <div className="divide-y divide-edge max-h-48 overflow-y-auto">
          {items.length === 0
            ? <div className="px-5 py-4 mono-label text-fog">NONE CONFIGURED</div>
            : items.map(item => (
              <div key={item.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-surface transition-colors">
                {renderItem(item)}
              </div>
            ))
          }
        </div>

        {/* Add form */}
        <div className="border-t border-edge p-4 bg-ink">
          <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="flex flex-wrap gap-2 items-end">
            {formContent}
            <button type="submit" className="btn-lime px-4 py-2 text-[9px]">
              <Plus size={10} /> ADD
            </button>
          </form>
        </div>
      </div>
    );
  }

  const warehouseOptions = data.warehouses.map(w => ({ value: w.id, label: w.name }));
  const locationTypes = ['shelf', 'rack', 'floor', 'production', 'other'].map(v => ({ value: v, label: v }));

  return (
    <PageShell title="Settings" subtitle="MASTER DATA CONFIGURATION">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Warehouses */}
        <ConfigSection
          title="WAREHOUSES"
          items={data.warehouses}
          renderItem={item => (
            <>
              <div>
                <p className="font-mono text-xs text-gray-200">{item.name}</p>
                {item.address && <p className="font-mono text-[9px] text-fog">{item.address}</p>}
              </div>
              <span className="mono-label text-fog">{item.id?.slice(0, 8)}...</span>
            </>
          )}
          formContent={<>
            <input
              value={forms.warehouse.name}
              onChange={e => updateForm('warehouse', 'name', e.target.value)}
              placeholder="Warehouse name" required className="input text-xs w-40"
            />
            <input
              value={forms.warehouse.address}
              onChange={e => updateForm('warehouse', 'address', e.target.value)}
              placeholder="Address" className="input text-xs w-48"
            />
          </>}
          onSubmit={() => submit('warehouse', 'warehouses', { name: '', address: '' })}
        />

        {/* Locations */}
        <ConfigSection
          title="LOCATIONS"
          items={data.locations}
          renderItem={item => (
            <>
              <div>
                <p className="font-mono text-xs text-gray-200">{item.name}</p>
                <p className="font-mono text-[9px] text-fog">{item.warehouse_name} · {item.type}</p>
              </div>
              <span className="font-mono text-[9px] text-lime bg-lime/5 border border-lime/20 px-2 py-0.5">{item.type}</span>
            </>
          )}
          formContent={<>
            <select
              value={forms.location.warehouse_id}
              onChange={e => updateForm('location', 'warehouse_id', e.target.value)}
              required className="input text-xs w-36 bg-ink"
            >
              <option value="">Warehouse...</option>
              {warehouseOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              value={forms.location.name}
              onChange={e => updateForm('location', 'name', e.target.value)}
              placeholder="Location name" required className="input text-xs w-36"
            />
            <select
              value={forms.location.type}
              onChange={e => updateForm('location', 'type', e.target.value)}
              className="input text-xs w-28 bg-ink"
            >
              {locationTypes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </>}
          onSubmit={() => submit('location', 'locations', { warehouse_id: '', name: '', type: 'shelf' })}
        />

        {/* Categories */}
        <ConfigSection
          title="PRODUCT CATEGORIES"
          items={data.categories}
          renderItem={item => (
            <p className="font-mono text-xs text-gray-200">{item.name}</p>
          )}
          formContent={<>
            <input
              value={forms.category.name}
              onChange={e => updateForm('category', 'name', e.target.value)}
              placeholder="Category name" required className="input text-xs w-52"
            />
          </>}
          onSubmit={() => submit('category', 'categories', { name: '' })}
        />

        {/* Suppliers */}
        <ConfigSection
          title="SUPPLIERS"
          items={data.suppliers}
          renderItem={item => (
            <>
              <div>
                <p className="font-mono text-xs text-gray-200">{item.name}</p>
                {item.email && <p className="font-mono text-[9px] text-fog">{item.email}</p>}
              </div>
              {item.contact && <span className="mono-label text-fog">{item.contact}</span>}
            </>
          )}
          formContent={<>
            <input
              value={forms.supplier.name}
              onChange={e => updateForm('supplier', 'name', e.target.value)}
              placeholder="Supplier name" required className="input text-xs w-36"
            />
            <input
              value={forms.supplier.contact}
              onChange={e => updateForm('supplier', 'contact', e.target.value)}
              placeholder="Phone" className="input text-xs w-32"
            />
            <input
              value={forms.supplier.email}
              onChange={e => updateForm('supplier', 'email', e.target.value)}
              placeholder="Email" className="input text-xs w-40"
            />
          </>}
          onSubmit={() => submit('supplier', 'suppliers', { name: '', contact: '', email: '' })}
        />

      </div>

      {/* System info */}
      <div className="panel border border-edge p-5 mt-4">
        <div className="mono-label mb-4">SYSTEM INFORMATION</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'WAREHOUSES', value: data.warehouses.length },
            { label: 'LOCATIONS', value: data.locations.length },
            { label: 'CATEGORIES', value: data.categories.length },
            { label: 'SUPPLIERS', value: data.suppliers.length },
          ].map(s => (
            <div key={s.label} className="border border-edge p-4">
              <div className="mono-label mb-1">{s.label}</div>
              <div className="font-mono text-2xl font-bold text-lime">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
