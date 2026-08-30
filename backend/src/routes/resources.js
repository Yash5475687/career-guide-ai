import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/resources?topic=&difficulty=&free=
router.get("/", (req, res) => {
  const { topic, difficulty, free } = req.query;
  let query = "SELECT * FROM resources WHERE 1=1";
  const params = [];
  if (topic) { query += " AND topic = ?"; params.push(topic); }
  if (difficulty) { query += " AND difficulty = ?"; params.push(difficulty); }
  if (free !== undefined) { query += " AND free = ?"; params.push(free === "true" ? 1 : 0); }
  query += " ORDER BY topic, title";
  const resources = db.prepare(query).all(...params);
  res.json({ resources });
});

router.get("/topics", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT topic FROM resources ORDER BY topic").all();
  res.json({ topics: rows.map((r) => r.topic) });
});

export default router;
