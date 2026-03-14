const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

/* ── In-memory OTP store ──────────────────────────────────────────────────
   For production use Redis or a DB table. This works perfectly for hackathon.
   Structure: { email -> { code, hashedCode, expiresAt, attempts } }
──────────────────────────────────────────────────────────────────────── */
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

function generateOtp() {
  // Cryptographically random 6-digit code
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

function maskEmail(email) {
  const [user, domain] = email.split('@');
  const masked = user.slice(0, 2) + '***' + user.slice(-1);
  return `${masked}@${domain}`;
}

/* ── POST /api/auth/otp/request ──────────────────────────────────────── */
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // Check user exists
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      // Return same message for security (don't reveal if email exists)
      return res.json({ message: `If ${maskEmail(email)} is registered, a code has been sent.`, expiresIn: 300 });
    }

    // Rate limit: don't allow request within 60s of last one
    const existing = otpStore.get(email);
    if (existing && existing.expiresAt > Date.now() && (existing.expiresAt - Date.now()) > (OTP_EXPIRY_MS - 60000)) {
      return res.status(429).json({ error: 'Please wait 60 seconds before requesting a new code' });
    }

    const otp = generateOtp();
    const hashedCode = await bcrypt.hash(otp, 8);
    otpStore.set(email, {
      hashedCode,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
      userId: rows[0].id,
    });

    // ── In a real app, send email here ──
    // e.g. await sendEmail({ to: email, subject: 'Your The Oilfather OTP', body: `Your code: ${otp}` });
    // For the hackathon, we log it to console:
    console.log(`\n╔══════════════════════════════╗`);
    console.log(`║  OTP for ${email.padEnd(20)} ║`);
    console.log(`║  Code: ${otp}                ║`);
    console.log(`║  Expires in 5 minutes        ║`);
    console.log(`╚══════════════════════════════╝\n`);

    res.json({
      message: `Code sent to ${maskEmail(email)}`,
      expiresIn: 300,
      // DEV ONLY — remove in production:
      ...(process.env.NODE_ENV !== 'production' && { _dev_otp: otp }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/* ── POST /api/auth/otp/verify ───────────────────────────────────────── */
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this email. Please request a new code.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(email);
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new code.' });
    }

    const valid = await bcrypt.compare(String(otp).trim(), record.hashedCode);
    if (!valid) {
      record.attempts += 1;
      const remaining = OTP_MAX_ATTEMPTS - record.attempts;
      return res.status(400).json({
        error: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      });
    }

    // ✓ Valid OTP — clean up and issue JWT
    otpStore.delete(email);

    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [record.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/* ── Cleanup expired OTPs every 10 minutes ── */
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt) otpStore.delete(email);
  }
}, 10 * 60 * 1000);

module.exports = router;
