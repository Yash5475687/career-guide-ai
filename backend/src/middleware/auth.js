import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";

export function signToken(userId) {
  return jwt.sign({ userId }, SECRET, { expiresIn: "30d" });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated. Missing bearer token." });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
  }
}
