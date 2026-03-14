import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { PageShell, Modal, Badge, Spinner, EmptyState, DataTable, Select, Input, LineEditor } from '../components/ui';

function OperationPage({ title, subtitle, endpoint, extraFields, lineQtyKey = 'qty', columns: extraCols }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({});
  const [lines, setLines] = useState([{ product_id: '', qty: '' }]);
  const [opts, setOpts] = useState({ products: [], locations: [], warehouses: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get(`/${endpoint}`);
    setItems(data); setLoading(false);
  }

  useEffect(() => {
    load();
    Promise.all([api.get('/products'), api.get('/locations'), api.get('/warehouses')]).then(([p, l, w]) => {
      setOpts({
        products: p.data.map(x => ({ value: x.id, label: `${x.name} (${x.sku})` })),
        locations: l.data.map(x => ({ value: x.id, label: `${x.warehouse_name} › ${x.name}` })),
        warehouses: w.data.map(x => ({ value: x.id, label: x.name })),
      });
    });
  }, []);

  async function openDetail(row) {
    try { const { data } = await api.get(`/${endpoint}/${row.id}`); setDetail(data); }
    catch { setDetail(row); }
  }

  async function validate(id) {
    try {
      await api.post(`/${endpoint}/${id}/validate`);
      load();
      if (detail?.id === id) { try { const { data } = await api.get(`/${endpoint}/${id}`); setDetail(data); } catch { setDetail(d => ({ ...d, status: 'done' })); } }
    } catch (err) { alert(err.response?.data?.error || 'Validation failed'); }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        lines: lines.filter(l => l.product_id).map(l => ({
          ...l,
          qty: Number(l.qty || l[lineQtyKey] || 0),
          qty_ordered: Number(l.qty || 0),
          [lineQtyKey]: Number(l.qty || 0),
        }))
      };
      await api.post(`/${endpoint}`, payload);
      setShowModal(false);
      setForm({}); setLines([{ product_id: '', qty: '' }]);
      load();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  const handleForm = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const baseColumns = [
    { key: 'reference', label: 'Reference', render: r => <span className="text-lime font-mono text-xs">{r.reference}</span> },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    ...(extraCols || []),
    { key: 'created_at', label: 'Created', render: r => new Date(r.created_at).toLocaleDateString() },
    {
      key: 'act', label: '',
      render: r => r.status !== 'done' && r.status !== 'cancelled'
        ? <button onClick={e => { e.stopPropagation(); validate(r.id); }} className="btn-ghost py-1 px-3 text-lime border-lime/30 hover:border-lime text-[9px]">
            ✓ VALIDATE
          </button>
        : null
    },
  ];

  const needsLocation = !['deliveries', 'transfers', 'adjustments'].includes(endpoint);

  return (
    <PageShell
      title={title}
      subtitle={subtitle}
      action={<button onClick={() => setShowModal(true)} className="btn-lime"><Plus size={12} />NEW {title.replace(/s$/, '').toUpperCase()}</button>}
    >
      <div className="panel border border-edge">
        {loading ? <Spinner />
          : items.length === 0
            ? <EmptyState title={`No ${title.toLowerCase()}`} description={`CREATE YOUR FIRST ${title.replace(/s$/, '').toUpperCase()}`} />
            : <DataTable columns={baseColumns} data={items} onRow={openDetail} />
        }
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`NEW ${title.replace(/s$/, '').toUpperCase()}`} wide>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="border border-red-900 bg-red-950/30 px-4 py-2 font-mono text-xs text-red-400">✗ {error}</div>}

          <div className="grid grid-cols-2 gap-4">
            {(extraFields || []).map(f =>
              f.type === 'select'
                ? <Select key={f.name} label={f.label} name={f.name} value={form[f.name] || ''} onChange={handleForm} options={opts[f.optKey] || []} required={f.required} />
                : <Input key={f.name} label={f.label} name={f.name} type={f.inputType || 'text'} value={form[f.name] || ''} onChange={handleForm} placeholder={f.placeholder} required={f.required} />
            )}
          </div>

          <div className="border-t border-edge pt-4">
            <LineEditor
              lines={lines}
              onChange={setLines}
              productOptions={opts.products}
              locationOptions={endpoint === 'deliveries' || endpoint === 'receipts' ? opts.locations : null}
              qtyKey={lineQtyKey}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">CANCEL</button>
            <button type="submit" disabled={saving} className="btn-lime flex-1 justify-center">{saving ? 'CREATING...' : `→ CREATE`}</button>
          </div>
        </form>
      </Modal>

      {detail && (
        <Modal open={!!detail} onClose={() => setDetail(null)} title={detail.reference || title.toUpperCase()}>
          <div className="space-y-4">
            <Badge status={detail.status} />
            <div className="border border-edge divide-y divide-edge">
              {(detail.lines || []).map((l, i) => (
                <div key={l.id || i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-mono text-xs text-gray-200">{l.product_name || 'Product'}</p>
                    {l.sku && <p className="font-mono text-[9px] text-fog">{l.sku}</p>}
                  </div>
                  <span className="font-mono text-sm text-lime font-bold">×{l.qty || l.qty_ordered || l.qty_expected || l.qty_counted || 0}</span>
                </div>
              ))}
              {(!detail.lines || detail.lines.length === 0) && (
                <div className="px-4 py-3 mono-label text-fog">NO LINES FOUND</div>
              )}
            </div>
            {detail.status !== 'done' && detail.status !== 'cancelled' && (
              <button onClick={() => validate(detail.id)} className="btn-lime w-full justify-center">
                ✓ VALIDATE — UPDATE STOCK LEDGER
              </button>
            )}
          </div>
        </Modal>
      )}
    </PageShell>
  );
}

export function DeliveriesPage() {
  return <OperationPage
    title="Deliveries" subtitle="OUTGOING STOCK TO CUSTOMERS" endpoint="deliveries"
    extraFields={[
      { name: 'customer_name', label: 'Customer / Order Ref', placeholder: 'Customer name' },
      { name: 'warehouse_id', label: 'Warehouse *', type: 'select', optKey: 'warehouses', required: true },
      { name: 'scheduled_date', label: 'Scheduled Date', inputType: 'date' },
      { name: 'notes', label: 'Notes', placeholder: 'Optional...' },
    ]}
    extraCols={[{ key: 'customer_name', label: 'Customer' }, { key: 'warehouse_name', label: 'Warehouse' }]}
    lineQtyKey="qty_ordered"
  />;
}

export function TransfersPage() {
  return <OperationPage
    title="Transfers" subtitle="INTERNAL STOCK MOVEMENTS" endpoint="transfers"
    extraFields={[
      { name: 'from_location_id', label: 'From Location *', type: 'select', optKey: 'locations', required: true },
      { name: 'to_location_id', label: 'To Location *', type: 'select', optKey: 'locations', required: true },
      { name: 'scheduled_date', label: 'Scheduled Date', inputType: 'date' },
      { name: 'notes', label: 'Notes', placeholder: 'Optional...' },
    ]}
    extraCols={[{ key: 'from_location', label: 'From' }, { key: 'to_location', label: 'To' }]}
    lineQtyKey="qty"
  />;
}

export function AdjustmentsPage() {
  return <OperationPage
    title="Adjustments" subtitle="PHYSICAL COUNT CORRECTIONS" endpoint="adjustments"
    extraFields={[
      { name: 'location_id', label: 'Location *', type: 'select', optKey: 'locations', required: true },
      { name: 'notes', label: 'Reason / Notes', placeholder: 'e.g. damaged goods, recount...' },
    ]}
    extraCols={[{ key: 'location_name', label: 'Location' }]}
    lineQtyKey="qty_counted"
  />;
}
