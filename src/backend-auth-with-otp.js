const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

/* ══════════════════════════════════════
   PASSWORD AUTH
══════════════════════════════════════ */

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
      [name, email, hash, role || 'staff']
    );
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(201).json({ user: rows[0], token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ user: { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role }, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: 'email and newPassword required' });
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, email]);
    res.json({ message: 'Password updated successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/auth/me
const authMw = require('../middleware/auth');
router.get('/me', authMw, async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id=$1', [req.user.id]);
  res.json(rows[0]);
});

/* ══════════════════════════════════════
   OTP AUTH
══════════════════════════════════════ */

const OTP_EXPIRY_MS   = 5 * 60 * 1000; // 5 min
const OTP_MAX_TRIES   = 5;
const otpStore        = new Map();      // email -> { hashedCode, expiresAt, attempts, userId }

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function maskEmail(email) {
  const [u, d] = email.split('@');
  return u.slice(0, 2) + '***' + u.slice(-1) + '@' + d;
}

// POST /api/auth/otp/request
router.post('/otp/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    // Always return same message (security: don't reveal if email exists)
    if (!rows.length) {
      return res.json({ message: `If ${maskEmail(email)} is registered, a code has been sent.`, expiresIn: 300 });
    }

    // Rate-limit: block re-request within first 60s
    const prev = otpStore.get(email);
    if (prev && prev.expiresAt - Date.now() > OTP_EXPIRY_MS - 60000) {
      return res.status(429).json({ error: 'Please wait 60 seconds before requesting a new code' });
    }

    const otp = genOtp();
    const hashedCode = await bcrypt.hash(otp, 8);
    otpStore.set(email, { hashedCode, expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0, userId: rows[0].id });

    // Log to console (replace with real email service in production)
    console.log(`\n┌─────────────────────────────────┐`);
    console.log(`│  OTP LOGIN                       │`);
    console.log(`│  Email : ${email.padEnd(22)} │`);
    console.log(`│  Code  : ${otp}                  │`);
    console.log(`│  Exp   : 5 minutes               │`);
    console.log(`└─────────────────────────────────┘\n`);

    res.json({
      message: `Code sent to ${maskEmail(email)}`,
      expiresIn: 300,
      ...(process.env.NODE_ENV !== 'production' && { _dev_otp: otp }),
    });
  } catch (e) { res.status(500).json({ error: 'Failed to generate OTP' }); }
});

// POST /api/auth/otp/verify
router.post('/otp/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
  try {
    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ error: 'No code found. Please request a new one.' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'Code has expired. Please request a new one.' });
    }
    if (record.attempts >= OTP_MAX_TRIES) {
      otpStore.delete(email);
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }
    const valid = await bcrypt.compare(String(otp).trim(), record.hashedCode);
    if (!valid) {
      record.attempts += 1;
      const left = OTP_MAX_TRIES - record.attempts;
      return res.status(400).json({ error: `Invalid code. ${left} attempt${left !== 1 ? 's' : ''} remaining.` });
    }
    otpStore.delete(email);
    const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id=$1', [record.userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ user: rows[0], token });
  } catch (e) { res.status(500).json({ error: 'Verification failed' }); }
});

// Cleanup expired OTPs every 10 min
setInterval(() => {
  const now = Date.now();
  for (const [email, r] of otpStore.entries()) { if (now > r.expiresAt) otpStore.delete(email); }
}, 10 * 60 * 1000);

module.exports = router;
