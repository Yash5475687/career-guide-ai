import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { askMentor } from "../services/aiMentor.js";

const router = Router();
router.use(requireAuth);

router.get("/history", (req, res) => {
  const rows = db.prepare(
    "SELECT id, role, message, created_at FROM ai_conversations WHERE user_id = ? ORDER BY id ASC LIMIT 100"
  ).all(req.userId);
  res.json({ history: rows });
});

router.post("/ask", async (req, res) => {
  const { question } = req.body || {};
  if (!question || !question.trim()) return res.status(400).json({ error: "question is required." });

  const user = db.prepare("SELECT name FROM users WHERE id = ?").get(req.userId);
  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);

  const recent = db.prepare(
    "SELECT role, message FROM ai_conversations WHERE user_id = ? ORDER BY id DESC LIMIT 10"
  ).all(req.userId).reverse();
  const history = recent.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.message }));

  db.prepare("INSERT INTO ai_conversations (user_id, role, message) VALUES (?, 'user', ?)").run(req.userId, question);

  const { answer, source } = await askMentor({
    profile: { name: user?.name, ...profile, interests: JSON.parse(profile?.interests || "[]") },
    question,
    history,
  });

  db.prepare("INSERT INTO ai_conversations (user_id, role, message) VALUES (?, 'assistant', ?)").run(req.userId, answer);

  res.json({ answer, source });
});

export default router;
