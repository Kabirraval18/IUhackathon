import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import api from '../lib/api';
import { StatCard, Badge, Spinner, Ticker } from '../components/ui';

const TICKER_ITEMS = [
  'RECEIPTS INCOMING', 'STOCK LEVELS NOMINAL', 'WAREHOUSE A ONLINE',
  'TRANSFERS ACTIVE', 'LOW STOCK ALERT MONITORING', 'DELIVERIES DISPATCHED',
  'INVENTORY SYNC COMPLETE', 'LEDGER UPDATED', 'ALL SYSTEMS OPERATIONAL'
];

function LiveFeed({ items }) {
  return (
    <div className="panel border border-edge h-full">
      <div className="px-5 py-3 border-b border-edge flex items-center gap-2">
        <div className="live-dot" />
        <span className="mono-label">LIVE STOCK FEED</span>
      </div>
      <div className="divide-y divide-edge overflow-y-auto" style={{ maxHeight: 380 }}>
        {items.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center justify-between px-5 py-3 hover:bg-surface transition-colors"
            style={{ animation: `slide-up 0.4s ease forwards`, animationDelay: `${i * 0.04}s`, opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-8 flex-shrink-0 ${Number(m.qty_change) > 0 ? 'bg-lime' : 'bg-red-500'}`} />
              <div>
                <p className="font-mono text-xs text-gray-200">{m.product_name}</p>
                <p className="font-mono text-[9px] text-fog">{m.sku} · {m.location_name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-mono text-sm font-bold ${Number(m.qty_change) > 0 ? 'text-lime' : 'text-red-400'}`}>
                {Number(m.qty_change) > 0 ? '+' : ''}{m.qty_change}
              </p>
              <Badge status={m.operation_type} />
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="flex items-center justify-center py-12">
            <span className="mono-label text-fog">NO MOVEMENTS RECORDED</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniChart({ data }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B9FF4B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#B9FF4B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 10 }}
          itemStyle={{ color: '#B9FF4B' }}
          labelStyle={{ color: '#555' }}
        />
        <Area type="monotone" dataKey="value" stroke="#B9FF4B" strokeWidth={1.5} fill="url(#limeGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/recent')])
      .then(([s, r]) => { setStats(s.data); setRecent(r.data); })
      .finally(() => setLoading(false));
  }, []);

  // Simulate sparkline data from recent movements
  const chartData = recent.slice(0, 12).map((m, i) => ({
    name: i,
    value: Math.abs(Number(m.qty_change))
  })).reverse();

  if (loading) return <div className="p-8"><Spinner /></div>;

  const lowStockAlert = stats.low_stock > 0;

  return (
    <div className="min-h-full" style={{ animation: 'glow-in 0.5s ease forwards' }}>
      {/* Ticker */}
      <Ticker items={TICKER_ITEMS} />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="mono-label mb-1">THE OILFATHER / COMMAND CENTER</div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
              Mission Control
            </h1>
            <p className="font-mono text-[10px] text-fog mt-1">
              Real-time inventory intelligence · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {lowStockAlert && (
            <div className="border border-red-800 bg-red-950/30 px-4 py-2 flex items-center gap-2 animate-pulse-lime">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-red-400">
                {stats.low_stock} LOW STOCK ALERT{stats.low_stock > 1 ? 'S' : ''}
              </span>
            </div>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <StatCard
            label="Total Products"
            value={stats.total_products}
            sub="in catalog"
            onClick={() => navigate('/products')}
          />
          <StatCard
            label="Low / Out of Stock"
            value={stats.low_stock}
            sub="need attention"
            accent={lowStockAlert}
            onClick={() => navigate('/products')}
          />
          <StatCard
            label="Pending Receipts"
            value={stats.pending_receipts}
            sub="incoming"
            onClick={() => navigate('/receipts')}
          />
          <StatCard
            label="Pending Deliveries"
            value={stats.pending_deliveries}
            sub="outgoing"
            onClick={() => navigate('/deliveries')}
          />
          <StatCard
            label="Transfers"
            value={stats.pending_transfers}
            sub="in transit"
            onClick={() => navigate('/transfers')}
          />
        </div>

        {/* Charts + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Sparkline panel */}
          <div className="panel border border-edge p-5 col-span-1">
            <div className="mono-label mb-1">MOVEMENT ACTIVITY</div>
            <div className="font-mono text-4xl font-bold text-lime mb-4">{recent.length}</div>
            <MiniChart data={chartData} />
            <div className="mono-label text-fog mt-2">RECENT LEDGER ENTRIES</div>
          </div>

          {/* Operation overview */}
          <div className="panel border border-edge p-5 col-span-1">
            <div className="mono-label mb-4">OPERATION STATUS</div>
            <div className="space-y-3">
              {[
                { label: 'Receipts Active', value: stats.pending_receipts, color: 'bg-lime' },
                { label: 'Deliveries Active', value: stats.pending_deliveries, color: 'bg-orange-400' },
                { label: 'Transfers Active', value: stats.pending_transfers, color: 'bg-blue-400' },
                { label: 'Low Stock Items', value: stats.low_stock, color: 'bg-red-500' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${row.color}`} />
                  <span className="font-mono text-[10px] text-fog flex-1">{row.label}</span>
                  <span className="font-mono text-xs text-gray-300 font-bold">{row.value}</span>
                  <div className="w-24 h-1 bg-edge rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} transition-all duration-1000`}
                      style={{ width: `${Math.min(100, (row.value / (stats.total_products || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System status */}
          <div className="panel border border-edge p-5 col-span-1">
            <div className="mono-label mb-4">SYSTEM STATUS</div>
            <div className="space-y-3">
              {[
                { label: 'API Connection', ok: true },
                { label: 'Database Sync', ok: true },
                { label: 'Ledger Integrity', ok: true },
                { label: 'Auth Service', ok: true },
                { label: 'Stock Alerts', ok: !lowStockAlert },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-fog">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-lime animate-pulse-lime' : 'bg-red-500 animate-pulse'}`} />
                    <span className={`font-mono text-[9px] tracking-widest ${s.ok ? 'text-lime' : 'text-red-400'}`}>
                      {s.ok ? 'NOMINAL' : 'ALERT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Feed */}
        <LiveFeed items={recent} />
      </div>
    </div>
  );
}
