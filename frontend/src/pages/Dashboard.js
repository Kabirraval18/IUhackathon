import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BENCHMARK_COLORS = {
  'Brent': '#5dade2', 'WTI': '#58d68d', 'OPEC Basket': '#c9a84c',
  'Dubai/Oman': '#eb984e', 'Urals': '#af7ac5', 'Bonny Light': '#45b39d', 'Mars Blend': '#ec7063'
};

const statusBadge = (count, label, color) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color, fontSize: '0.85rem' }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
    {count} {label}
  </span>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 4 }}>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill || 'var(--gold)', fontSize: '0.9rem' }}>
          {p.value?.toLocaleString()} bbl
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => {
      setStats(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="full-loader">
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      <p>Loading operations...</p>
    </div>
  );

  const benchmarkData = stats?.stockByBenchmark
    ? Object.entries(stats.stockByBenchmark).map(([name, value]) => ({ name, value }))
    : [];

  const activityTypeColors = { IN: 'var(--green-light)', OUT: 'var(--red-light)', ADJUST: 'var(--amber-light)', TRANSFER_IN: 'var(--blue-light)', TRANSFER_OUT: '#af7ac5' };

  return (
    <div className="fade-up">
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
          Welcome back, <span style={{ color: 'var(--gold)' }}>{user?.name}</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {[
          { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: '🛢', sub: 'Active crude grades' },
          { label: 'Low Stock Alerts', value: stats?.lowStockCount ?? 0, icon: '⚠', sub: 'Below reorder point', color: 'var(--amber-light)' },
          { label: 'Out of Stock', value: stats?.outOfStockCount ?? 0, icon: '🚫', sub: 'Zero inventory', color: 'var(--red-light)' },
          { label: 'Pending Receipts', value: stats?.pendingReceipts ?? 0, icon: '↓', sub: 'Awaiting validation', color: 'var(--blue-light)' },
          { label: 'Pending Deliveries', value: stats?.pendingDeliveries ?? 0, icon: '↑', sub: 'Ready to dispatch', color: 'var(--green-light)' },
          { label: 'Transfers Scheduled', value: stats?.scheduledTransfers ?? 0, icon: '⇄', sub: 'Internal moves', color: 'var(--gold)' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color: kpi.color || 'var(--gold-light)' }}>{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Benchmark Bar Chart */}
        <div className="card">
          <div className="card-title">📊 Stock by Benchmark (Barrels)</div>
          {benchmarkData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={benchmarkData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {benchmarkData.map((entry) => (
                    <Cell key={entry.name} fill={BENCHMARK_COLORS[entry.name] || 'var(--gold)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="icon">📊</div><p>No stock data</p></div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="card-title">🥧 Distribution by Benchmark</div>
          {benchmarkData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={benchmarkData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {benchmarkData.map((entry) => (
                    <Cell key={entry.name} fill={BENCHMARK_COLORS[entry.name] || 'var(--gold)'} stroke="var(--dark-2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [`${v?.toLocaleString()} bbl`, 'Stock']} contentStyle={{ background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }} />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="icon">🥧</div><p>No data</p></div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="card-title">⚡ Recent Activity</div>
          {stats?.recentActivity?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {stats.recentActivity.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: activityTypeColors[entry.type] || 'var(--text-muted)', background: 'var(--dark-3)', padding: '2px 6px', borderRadius: 2, minWidth: 80, textAlign: 'center' }}>
                    {entry.type}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong>{entry.product?.name || '—'}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{entry.warehouse?.name}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: entry.quantity > 0 ? 'var(--green-light)' : 'var(--red-light)' }}>
                    {entry.quantity > 0 ? '+' : ''}{entry.quantity?.toLocaleString()} bbl
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No recent activity</p></div>
          )}
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="card-title">⚠️ Low Stock Alerts</div>
          {stats?.lowStockItems?.length ? (
            <div>
              {stats.lowStockItems.map((item, i) => {
                const pct = item.product?.reorderPoint ? Math.min(100, (item.quantity / item.product.reorderPoint) * 100) : 50;
                return (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                      <strong>{item.product?.name}</strong>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--amber-light)' }}>
                        {item.quantity?.toLocaleString()} / {item.product?.reorderPoint?.toLocaleString()} bbl
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--dark-4)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct < 30 ? 'var(--red-light)' : 'var(--amber-light)', borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}><div className="icon">✅</div><p>All stock levels healthy</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
