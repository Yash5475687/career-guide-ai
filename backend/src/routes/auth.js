import { Router } from "express";
import { db } from "../db.js";
import { sendOtpEmail, generateOtp } from "../services/emailProvider.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 30;
const MAX_ATTEMPTS = 5;

// POST /api/auth/request-code  { email }
router.post("/request-code", async (req, res) => {
  const { email } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.prepare("SELECT * FROM otp_codes WHERE email = ?").get(normalizedEmail);
  if (existing) {
    const secondsSinceLastSend = (Date.now() - new Date(existing.last_sent_at + "Z").getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      return res.status(429).json({
        error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend)}s before requesting another code.`,
      });
    }
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO otp_codes (email, code, expires_at, attempts, last_sent_at)
     VALUES (@email, @code, @expires_at, 0, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET code = @code, expires_at = @expires_at, attempts = 0, last_sent_at = datetime('now')`
  ).run({ email: normalizedEmail, code, expires_at: expiresAt });

  const result = await sendOtpEmail({ email: normalizedEmail, code });

  res.json({
    message: "Verification code sent.",
    expiresInMinutes: OTP_TTL_MINUTES,
    // Only present in dev mode — see services/emailProvider.js
    devCode: result.devCode,
    mode: result.mode,
  });
});

// POST /api/auth/verify-code  { email, code }
router.post("/verify-code", (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: "Email and code are required." });
  const normalizedEmail = email.trim().toLowerCase();

  const record = db.prepare("SELECT * FROM otp_codes WHERE email = ?").get(normalizedEmail);
  if (!record) return res.status(400).json({ error: "No verification code found. Please request a new one." });

  if (record.attempts >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: "Too many attempts. Please request a new code." });
  }
  if (new Date(record.expires_at + "Z").getTime() < Date.now()) {
    return res.status(400).json({ error: "This code has expired. Please request a new one." });
  }
  if (record.code !== String(code).trim()) {
    db.prepare("UPDATE otp_codes SET attempts = attempts + 1 WHERE email = ?").run(normalizedEmail);
    return res.status(400).json({ error: "Incorrect code. Please try again." });
  }

  // Success — consume the code
  db.prepare("DELETE FROM otp_codes WHERE email = ?").run(normalizedEmail);

  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);
  const isNewUser = !user;
  if (!user) {
    const info = db.prepare(
      "INSERT INTO users (email, last_login) VALUES (?, datetime('now'))"
    ).run(normalizedEmail);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    db.prepare("INSERT INTO profiles (user_id) VALUES (?)").run(user.id);
  } else {
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
  }

  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(user.id);
  const token = signToken(user.id);

  res.json({
    token,
    isNewUser,
    hasName: Boolean(user.name && user.college),
    onboardingComplete: Boolean(profile?.onboarding_complete),
    user: { id: user.id, email: user.email, name: user.name, college: user.college },
  });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, email, name, college, created_at, last_login FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);
  res.json({
    user,
    profile: profile ? { ...profile, interests: JSON.parse(profile.interests || "[]") } : null,
  });
});

export default router;
