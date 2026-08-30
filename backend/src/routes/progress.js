import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function getValue(userId, key, fallback) {
  const row = db.prepare("SELECT value FROM user_progress WHERE user_id = ? AND key = ?").get(userId, key);
  return row ? JSON.parse(row.value) : fallback;
}

function setValue(userId, key, value) {
  db.prepare(
    `INSERT INTO user_progress (user_id, key, value) VALUES (?, ?, ?)
     ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(userId, key, JSON.stringify(value));
}

// ---- Roadmap milestones ---------------------------------------------------
router.get("/roadmap", (req, res) => {
  res.json({ roadmap: getValue(req.userId, "roadmap_milestones", { completed: [] }) });
});

router.post("/roadmap/toggle", (req, res) => {
  const { milestoneId } = req.body || {};
  if (!milestoneId) return res.status(400).json({ error: "milestoneId is required." });
  const current = getValue(req.userId, "roadmap_milestones", { completed: [] });
  const set = new Set(current.completed);
  if (set.has(milestoneId)) set.delete(milestoneId); else set.add(milestoneId);
  const updated = { completed: [...set] };
  setValue(req.userId, "roadmap_milestones", updated);
  res.json({ roadmap: updated });
});

// ---- Study planner ----------------------------------------------------
router.get("/study-plan", (req, res) => {
  res.json({ studyPlan: getValue(req.userId, "study_plan", { blocks: [], streak: 0, lastCompletedDate: null, completedDates: [] }) });
});

router.put("/study-plan", (req, res) => {
  const { blocks } = req.body || {};
  if (!Array.isArray(blocks)) return res.status(400).json({ error: "blocks must be an array." });
  const current = getValue(req.userId, "study_plan", { blocks: [], streak: 0, lastCompletedDate: null, completedDates: [] });
  const updated = { ...current, blocks };
  setValue(req.userId, "study_plan", updated);
  res.json({ studyPlan: updated });
});

router.post("/study-plan/complete-today", (req, res) => {
  const current = getValue(req.userId, "study_plan", { blocks: [], streak: 0, lastCompletedDate: null, completedDates: [] });
  const today = new Date().toISOString().slice(0, 10);
  if (current.lastCompletedDate === today) {
    return res.json({ studyPlan: current, message: "Already marked complete for today." });
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = current.lastCompletedDate === yesterday ? current.streak + 1 : 1;
  const updated = {
    ...current,
    streak,
    lastCompletedDate: today,
    completedDates: [...(current.completedDates || []), today].slice(-90),
  };
  setValue(req.userId, "study_plan", updated);
  res.json({ studyPlan: updated });
});

// ---- Internship / job readiness checklist ---------------------------------
const DEFAULT_CHECKLIST = {
  github: false,
  resume: false,
  linkedin: false,
  portfolio: false,
  projects: false,
  dsa: false,
  communication: false,
  coreSubjects: false,
  interviewPrep: false,
};

router.get("/readiness", (req, res) => {
  res.json({ readiness: { ...DEFAULT_CHECKLIST, ...getValue(req.userId, "readiness_checklist", {}) } });
});

router.patch("/readiness", (req, res) => {
  const current = { ...DEFAULT_CHECKLIST, ...getValue(req.userId, "readiness_checklist", {}) };
  const updated = { ...current, ...req.body };
  setValue(req.userId, "readiness_checklist", updated);
  const total = Object.keys(DEFAULT_CHECKLIST).length;
  const done = Object.values(updated).filter(Boolean).length;
  res.json({ readiness: updated, score: Math.round((done / total) * 100) });
});

export default router;
