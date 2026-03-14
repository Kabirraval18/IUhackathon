import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to The OilFather');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="oil-bg" />
      <div className="grid-lines" />

      <div className="auth-left">
        <div className="auth-hero-text fade-up">
          <h2>An Offer You<br /><em>Cannot</em><br />Refuse</h2>
          <p>Track every barrel of crude from wellhead to delivery. Complete visibility over your Brent, WTI, OPEC, and Dubai benchmark inventories—all in one command center.</p>
          <div className="auth-stat">
            <div className="auth-stat-item"><div className="val">Live</div><div className="lbl">Stock Updates</div></div>
            <div className="auth-stat-item"><div className="val">Full</div><div className="lbl">Audit Ledger</div></div>
            <div className="auth-stat-item"><div className="val">Multi</div><div className="lbl">Warehouse</div></div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-brand">
          <div className="auth-brand-logo">🛢</div>
          <h1>The OilFather</h1>
          <p>Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="fade-up">
          <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Welcome Back</h3>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="don@oilfather.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1.2rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--gold-dark)', fontSize: '0.85rem' }}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Enter The Family'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New here? <Link to="/signup" style={{ color: 'var(--gold)' }}>Create account</Link>
          </p>

          {/* Demo credentials */}
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>DEMO CREDENTIALS</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>admin@oilfather.com</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--gold-dark)' }}>Admin@123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
