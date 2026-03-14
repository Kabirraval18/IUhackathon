import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error('All fields required');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      setUserId(data.userId);
      if (data.devOtp) {
        toast.success(`DEV MODE — OTP: ${data.devOtp}`, { duration: 10000 });
      } else {
        toast.success('OTP sent to your email');
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpValues];
    updated[index] = value;
    setOtpValues(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const otp = otpValues.join('');
    if (otp.length < 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Account verified! Welcome to The OilFather');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      const { data } = await api.post('/auth/resend-otp', { userId });
      if (data.devOtp) toast.success(`New OTP: ${data.devOtp}`, { duration: 10000 });
      else toast.success('New OTP sent');
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <div className="oil-bg" />
      <div className="grid-lines" />

      {/* Left hero */}
      <div className="auth-left">
        <div className="auth-hero-text fade-up">
          <h2>Control Your<br /><em>Black Gold</em><br />Empire</h2>
          <p>The OilFather Inventory Management System gives you real-time command over every barrel—from Brent to OPEC, across all terminals and refineries.</p>
          <div className="auth-stat">
            <div className="auth-stat-item"><div className="val">8+</div><div className="lbl">Crude Benchmarks</div></div>
            <div className="auth-stat-item"><div className="val">∞</div><div className="lbl">Warehouses</div></div>
            <div className="auth-stat-item"><div className="val">Real-time</div><div className="lbl">Stock Ledger</div></div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-brand">
          <div className="auth-brand-logo">🛢</div>
          <h1>The OilFather</h1>
          <p>Inventory Management System</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSignup} className="fade-up">
            <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Create Your Account</h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Don Corleone" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="don@oilfather.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Warehouse Staff</option>
                <option value="manager">Inventory Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Already a member? <Link to="/login" style={{ color: 'var(--gold)' }}>Sign in</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <div className="fade-up">
            <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Verify Your Identity</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              A 6-digit code was sent to <strong style={{ color: 'var(--text-secondary)' }}>{form.email}</strong>
            </p>
            <div className="otp-grid">
              {otpValues.map((val, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  className="otp-input"
                  maxLength={1}
                  value={val}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  inputMode="numeric"
                />
              ))}
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleVerify} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Verify & Enter'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Didn't receive it?{' '}
              <button onClick={resendOtp} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem' }}>
                Resend OTP
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
