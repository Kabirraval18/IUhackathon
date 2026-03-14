import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Loader2, Sun, Moon, ArrowLeft, RefreshCw } from 'lucide-react';

/* ─── Theme toggle pill (shown on auth pages) ─── */
function ThemePill() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      style={{
        position: 'fixed', top: 20, right: 20, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 14px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'var(--text-ash)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.color = 'var(--lime)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-ash)'; }}
    >
      {theme === 'dark'
        ? <Sun size={12} />
        : <Moon size={12} />
      }
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}

/* ─── Shell wrapper ─── */
function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, position: 'relative', overflow: 'hidden',
      transition: 'background 0.35s',
    }}>
      <ThemePill />
      {/* Grid */}
      <div className="bg-grid-theme" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'var(--glow-orb)', filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 440, animation: 'glow-in 0.55s ease forwards' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div className="live-dot" />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--lime)' }}>
              SYSTEM ONLINE
            </span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, transition: 'color 0.35s' }}>
            The Oilfather
          </h1>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-fog)', marginTop: 8 }}>
            Mission Control — v2.0
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow)',
          position: 'relative',
          transition: 'background 0.35s,border-color 0.35s',
        }}>
          {/* corner accents */}
          <div style={{ position: 'absolute', top: -1, left: -1, width: 16, height: 16, borderTop: '2px solid var(--lime)', borderLeft: '2px solid var(--lime)' }} />
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, borderBottom: '2px solid var(--lime)', borderRight: '2px solid var(--lime)' }} />
          {children}
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-fog)', marginTop: 20 }}>
          THE OILFATHER © 2025 — ALL STOCK MOVEMENTS LOGGED
        </p>
      </div>
    </div>
  );
}

/* ─── Error box ─── */
function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)', padding: '10px 14px' }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#f87171' }}>✗ {msg}</span>
    </div>
  );
}

/* ─── Success box ─── */
function SuccessBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ border: '1px solid rgba(185,255,75,0.3)', background: 'var(--lime-muted)', padding: '10px 14px' }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--lime)' }}>✓ {msg}</span>
    </div>
  );
}

/* ─── OTP Digit Boxes ─── */
function OtpInput({ value, onChange, onComplete }) {
  const inputs = useRef([]);
  const digits = value.split('');

  function handleKey(i, e) {
    const key = e.key;
    if (key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        next[i - 1] = '';
        onChange(next.join(''));
        inputs.current[i - 1]?.focus();
      }
    } else if (key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (key === 'ArrowRight' && i < 5) {
      inputs.current[i + 1]?.focus();
    } else if (/^\d$/.test(key)) {
      e.preventDefault();
      const next = [...digits];
      next[i] = key;
      const joined = next.join('');
      onChange(joined);
      if (i < 5) {
        inputs.current[i + 1]?.focus();
      } else if (joined.length === 6) {
        onComplete?.(joined);
      }
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) onComplete?.(pasted);
    else inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          className={`otp-box ${digits[i] ? 'filled' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={() => {}}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

/* ─── Countdown timer ─── */
function Countdown({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: remaining < 30 ? '#f87171' : 'var(--text-fog)', fontVariantNumeric: 'tabular-nums' }}>
      {m}:{s}
    </span>
  );
}

/* ══════════════════════════════════════════════════
   LOGIN PAGE — tabs: Password | OTP
══════════════════════════════════════════════════ */
export function LoginPage() {
  const { login, requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('password'); // 'password' | 'otp'

  // Password state
  const [pwForm, setPwForm] = useState({ email: '', password: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState('email'); // 'email' | 'verify'
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  async function submitPassword(e) {
    e.preventDefault();
    setPwLoading(true); setPwError('');
    try { await login(pwForm.email, pwForm.password); navigate('/'); }
    catch (err) { setPwError(err.response?.data?.error || 'Authentication failed'); }
    finally { setPwLoading(false); }
  }

  async function requestCode(e) {
    e?.preventDefault();
    if (!otpEmail) return;
    setOtpLoading(true); setOtpError(''); setOtpSuccess('');
    try {
      await requestOtp(otpEmail);
      setOtpStep('verify');
      setOtpCode('');
      setOtpExpired(false);
      setOtpSuccess(`Code sent to ${otpEmail}`);
      setResendCooldown(60);
    } catch (err) { setOtpError(err.response?.data?.error || 'Failed to send code'); }
    finally { setOtpLoading(false); }
  }

  async function verifyCode(code) {
    const c = code || otpCode;
    if (c.length < 6) return;
    setOtpLoading(true); setOtpError('');
    try { await verifyOtp(otpEmail, c); navigate('/'); }
    catch (err) { setOtpError(err.response?.data?.error || 'Invalid or expired code'); }
    finally { setOtpLoading(false); }
  }

  const tabStyle = (t) => ({
    flex: 1, padding: '12px 0',
    fontFamily: 'JetBrains Mono', fontSize: 10,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    cursor: 'pointer', border: 'none',
    borderBottom: tab === t ? '2px solid var(--lime)' : '2px solid transparent',
    background: 'transparent',
    color: tab === t ? 'var(--lime)' : 'var(--text-fog)',
    transition: 'color 0.2s,border-color 0.2s',
  });

  return (
    <AuthShell>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        <button style={tabStyle('password')} onClick={() => setTab('password')}>PASSWORD</button>
        <button style={tabStyle('otp')} onClick={() => setTab('otp')}>OTP LOGIN</button>
      </div>

      {/* ── PASSWORD TAB ── */}
      {tab === 'password' && (
        <form onSubmit={submitPassword} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ErrorBox msg={pwError} />
          <div>
            <label className="input-label">Email address</label>
            <input
              type="email" value={pwForm.email} required
              onChange={e => setPwForm(f => ({ ...f, email: e.target.value }))}
              placeholder="operator@warehouse.io" className="input"
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password" value={pwForm.password} required
              onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••••••" className="input"
            />
          </div>
          <button type="submit" disabled={pwLoading} className="btn btn-lime" style={{ width: '100%', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
            {pwLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '→ AUTHENTICATE'}
          </button>
          <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-fog)' }}>
            No account?{' '}
            <Link to="/signup" style={{ color: 'var(--lime)', textDecoration: 'none' }}>CREATE ACCESS</Link>
          </p>
        </form>
      )}

      {/* ── OTP TAB ── */}
      {tab === 'otp' && (
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 1: Enter email */}
          {otpStep === 'email' && (
            <form onSubmit={requestCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-fog)', letterSpacing: '0.08em', lineHeight: 1.7 }}>
                Enter your registered email to receive a 6-digit access code.
              </p>
              <ErrorBox msg={otpError} />
              <div>
                <label className="input-label">Email address</label>
                <input
                  type="email" value={otpEmail} required
                  onChange={e => setOtpEmail(e.target.value)}
                  placeholder="operator@warehouse.io" className="input"
                />
              </div>
              <button type="submit" disabled={otpLoading || !otpEmail} className="btn btn-lime" style={{ width: '100%', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                {otpLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '→ SEND ACCESS CODE'}
              </button>
              <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-fog)' }}>
                Have a password?{' '}
                <button type="button" onClick={() => setTab('password')} style={{ color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  USE PASSWORD
                </button>
              </p>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {otpStep === 'verify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => { setOtpStep('email'); setOtpError(''); setOtpSuccess(''); setOtpCode(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-fog)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono', fontSize: 10 }}
                >
                  <ArrowLeft size={12} /> BACK
                </button>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-fog)' }}>
                  SENT TO {otpEmail.toUpperCase()}
                </span>
              </div>

              <SuccessBox msg={otpSuccess} />
              <ErrorBox msg={otpError} />

              <div>
                <label className="input-label" style={{ textAlign: 'center', marginBottom: 14 }}>Enter 6-digit access code</label>
                <OtpInput value={otpCode} onChange={setOtpCode} onComplete={verifyCode} />
              </div>

              {/* Timer + expiry */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-fog)' }}>EXPIRES IN</span>
                  {!otpExpired
                    ? <Countdown seconds={300} onExpire={() => setOtpExpired(true)} />
                    : <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#f87171' }}>EXPIRED</span>
                  }
                </div>
                <button
                  onClick={() => { setResendCooldown(0); requestCode(); }}
                  disabled={resendCooldown > 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.12em',
                    color: resendCooldown > 0 ? 'var(--text-fog)' : 'var(--lime)',
                    textTransform: 'uppercase',
                  }}
                >
                  <RefreshCw size={10} />
                  {resendCooldown > 0 ? `RESEND (${resendCooldown}s)` : 'RESEND CODE'}
                </button>
              </div>

              {/* Resend countdown */}
              {resendCooldown > 0 && (
                <ResendTimer seconds={resendCooldown} onDone={() => setResendCooldown(0)} />
              )}

              <button
                onClick={() => verifyCode(otpCode)}
                disabled={otpLoading || otpCode.length < 6}
                className="btn btn-lime"
                style={{ width: '100%', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}
              >
                {otpLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '→ VERIFY & ENTER'}
              </button>
            </div>
          )}
        </div>
      )}
    </AuthShell>
  );
}

/* invisible resend timer */
function ResendTimer({ seconds, onDone }) {
  const [rem, setRem] = useState(seconds);
  useEffect(() => {
    if (rem <= 0) { onDone(); return; }
    const t = setTimeout(() => setRem(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rem]);
  return null;
}

/* ══════════════════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════════════════ */
export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try { await signup(form.name, form.email, form.password, form.role); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell>
      <div style={{ padding: '14px 28px 6px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-fog)' }}>AUTH / REGISTER</span>
      </div>
      <form onSubmit={submit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ErrorBox msg={error} />
        <div>
          <label className="input-label">Full Name</label>
          <input value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="input" />
        </div>
        <div>
          <label className="input-label">Email address</label>
          <input type="email" value={form.email} required onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="operator@warehouse.io" className="input" />
        </div>
        <div>
          <label className="input-label">Password</label>
          <input type="password" value={form.password} required onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••••••" className="input" />
        </div>
        <div>
          <label className="input-label">Access Role</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input" style={{ background: 'var(--input-bg)' }}>
            <option value="staff">Warehouse Staff</option>
            <option value="manager">Inventory Manager</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn btn-lime" style={{ width: '100%', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '→ CREATE ACCESS'}
        </button>
        <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-fog)' }}>
          Have access?{' '}
          <Link to="/login" style={{ color: 'var(--lime)', textDecoration: 'none' }}>SIGN IN</Link>
        </p>
      </form>
    </AuthShell>
  );
}
