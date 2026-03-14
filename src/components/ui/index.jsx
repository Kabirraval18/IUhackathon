import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Loader2, X, Plus, Trash2 } from 'lucide-react';

/* ── Animated counter ── */
export function Counter({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const start = Date.now();
    const dur = 1200;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

/* ── KPI stat card ── */
export function StatCard({ label, value, suffix = '', prefix = '', sub, accent = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'panel corner-accent p-5 transition-all duration-300 cursor-pointer group',
        accent ? 'border-lime lime-glow' : 'hover:border-lime/30 hover:lime-glow'
      )}
    >
      <div className="mono-label mb-3">{label}</div>
      <div className={clsx('font-mono text-3xl font-bold leading-none mb-2 transition-all', accent ? 'text-lime lime-text-glow' : 'text-gray-200 group-hover:text-lime')}>
        <Counter value={value} prefix={prefix} suffix={suffix} />
      </div>
      {sub && <div className="mono-label text-fog">{sub}</div>}
    </div>
  );
}

/* ── Badge ── */
export function Badge({ status }) {
  const cls = `badge badge-${status}`;
  return <span className={cls}>{status?.replace(/_/g, ' ')}</span>;
}

/* ── Spinner ── */
export function Spinner({ size = 16 }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={size} className="animate-spin text-lime" />
        <span className="mono-label">LOADING...</span>
      </div>
    </div>
  );
}

/* ── Empty state ── */
export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <div className="w-16 h-16 border border-edge flex items-center justify-center mb-4 relative">
        <span className="text-2xl opacity-30">▣</span>
        <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-lime" />
        <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-lime" />
      </div>
      <p className="font-display text-lg font-semibold text-gray-400 mb-1">{title}</p>
      {description && <p className="mono-label text-fog mt-1 mb-5">{description}</p>}
      {action && action}
    </div>
  );
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={clsx('modal-box', wide && 'max-w-3xl')}
        onClick={e => e.stopPropagation()}
        style={{ animation: 'glow-in 0.25s ease forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <div className="flex items-center gap-3">
            <div className="live-dot" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-lime">{title}</span>
          </div>
          <button onClick={onClose} className="text-fog hover:text-lime transition-colors">
            <X size={14} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Form controls ── */
export function Field({ label, children }) {
  return (
    <div>
      {label && <label className="input-label">{label}</label>}
      {children}
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <Field label={label}>
      <input className="input" {...props} />
    </Field>
  );
}

export function Select({ label, options = [], ...props }) {
  return (
    <Field label={label}>
      <select className="input bg-ink" {...props}>
        <option value="">— select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

/* ── Data table ── */
export function DataTable({ columns, data, onRow, loading }) {
  if (loading) return <Spinner />;
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRow?.(row)}
              className={clsx(onRow && 'cursor-pointer')}
            >
              {columns.map(c => (
                <td key={c.key}>
                  {c.render ? c.render(row) : (row[c.key] ?? <span className="text-fog">—</span>)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Line item editor ── */
export function LineEditor({ lines, onChange, productOptions, locationOptions, qtyKey = 'qty_expected' }) {
  function update(i, field, val) {
    onChange(lines.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  }
  function add() { onChange([...lines, { product_id: '', location_id: '', [qtyKey]: '' }]); }
  function remove(i) { onChange(lines.filter((_, idx) => idx !== i)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="mono-label">Product lines</span>
        <button type="button" onClick={add} className="btn-ghost px-3 py-1 text-[9px]">
          <Plus size={10} /> ADD LINE
        </button>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i} className="grid gap-2" style={{ gridTemplateColumns: locationOptions ? '1fr 1fr 70px 28px' : '1fr 70px 28px' }}>
            <select value={line.product_id} onChange={e => update(i, 'product_id', e.target.value)} className="input text-xs">
              <option value="">Product...</option>
              {productOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {locationOptions && (
              <select value={line.location_id || ''} onChange={e => update(i, 'location_id', e.target.value)} className="input text-xs">
                <option value="">Location...</option>
                {locationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            <input
              type="number" min="0" placeholder="Qty"
              value={line[qtyKey] || ''}
              onChange={e => update(i, qtyKey, e.target.value)}
              className="input text-xs"
            />
            {lines.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-fog hover:text-red-400 transition-colors flex items-center justify-center">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page shell ── */
export function PageShell({ title, subtitle, action, children }) {
  return (
    <div className="p-8 min-h-full animate-glow-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="mono-label mb-1">THE OILFATHER / {title.toUpperCase()}</div>
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mono-label text-fog mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── Live ticker ── */
export function Ticker({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-edge bg-ink py-2 relative">
      <div className="flex gap-8 animate-ticker whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} className="mono-label inline-flex items-center gap-2 text-fog">
            <span className="text-lime">◆</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Section divider ── */
export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-edge" />
      <span className="mono-label">{label}</span>
      <div className="flex-1 h-px bg-edge" />
    </div>
  );
}

/* ── Validate button ── */
export function ValidateBtn({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-lime disabled:opacity-30 disabled:cursor-not-allowed"
    >
      ✓ VALIDATE
    </button>
  );
}
