import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setUserId(data.userId);
      if (data.devOtp) toast.success(`DEV OTP: ${data.devOtp}`, { duration: 10000 });
      else toast.success('Reset OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
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

  const handleReset = async () => {
    const otp = otpValues.join('');
    if (otp.length < 6 || !newPassword) return toast.error('Fill all fields');
    if (newPassword.length < 6) return toast.error('Password min 6 chars');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { userId, otp, newPassword });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="oil-bg" /><div className="grid-lines" />
      <div className="auth-left">
        <div className="auth-hero-text fade-up">
          <h2>Reclaim Your<br /><em>Access</em></h2>
          <p>Reset your password securely with a one-time OTP delivered to your registered email address.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-brand">
          <div className="auth-brand-logo">🛢</div>
          <h1>The OilFather</h1>
          <p>Password Reset</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="fade-up">
            <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '1.5rem' }}>Forgot Password</h3>
            <div className="form-group">
              <label className="form-label">Your Email Address</label>
              <input type="email" className="form-input" placeholder="don@oilfather.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Send Reset OTP'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Link to="/login" style={{ color: 'var(--gold)' }}>Back to login</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <div className="fade-up">
            <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Enter OTP & New Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Code sent to {email}</p>
            <div className="otp-grid">
              {otpValues.map((val, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el} className="otp-input"
                  maxLength={1} value={val} inputMode="numeric"
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !val && i > 0) otpRefs.current[i-1]?.focus(); }} />
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Min 6 characters"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }} onClick={handleReset} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
