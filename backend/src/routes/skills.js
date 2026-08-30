import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/skills — full catalog
router.get("/", (req, res) => {
  const skills = db.prepare("SELECT * FROM skills ORDER BY category, name").all();
  res.json({ skills });
});

router.use(requireAuth);

// GET /api/skills/mine — catalog merged with the student's status/progress
router.get("/mine", (req, res) => {
  const rows = db.prepare(
    `SELECT s.id, s.name, s.category, COALESCE(us.status, 'not_started') AS status, COALESCE(us.progress, 0) AS progress
     FROM skills s
     LEFT JOIN user_skills us ON us.skill_id = s.id AND us.user_id = ?
     ORDER BY s.category, s.name`
  ).all(req.userId);
  res.json({ skills: rows });
});

// PATCH /api/skills/:id  { status, progress }
router.patch("/:id", (req, res) => {
  const { status, progress } = req.body || {};
  const validStatuses = ["not_started", "learning", "practicing", "completed"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${validStatuses.join(", ")}` });
  }
  const clampedProgress = progress === undefined ? undefined : Math.max(0, Math.min(100, Number(progress)));

  const existing = db.prepare("SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?").get(req.userId, req.params.id);
  if (existing) {
    db.prepare(
      `UPDATE user_skills SET status = COALESCE(?, status), progress = COALESCE(?, progress), updated_at = datetime('now')
       WHERE user_id = ? AND skill_id = ?`
    ).run(status, clampedProgress, req.userId, req.params.id);
  } else {
    db.prepare(
      `INSERT INTO user_skills (user_id, skill_id, status, progress) VALUES (?, ?, ?, ?)`
    ).run(req.userId, req.params.id, status || "learning", clampedProgress ?? 10);
  }
  const row = db.prepare("SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?").get(req.userId, req.params.id);
  res.json({ skill: row });
});

export default router;
