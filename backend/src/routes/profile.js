import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { starterSkillsForInterests, careerIdForGoal } from "../services/recommendationEngine.js";

const router = Router();
router.use(requireAuth);

// PATCH /api/profile/basic  { name, college }  -- step 3 of sign-in
router.patch("/basic", (req, res) => {
  const { name, college } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: "Name is required." });
  if (!college || !college.trim()) return res.status(400).json({ error: "College is required." });
  db.prepare("UPDATE users SET name = ?, college = ? WHERE id = ?").run(name.trim(), college.trim(), req.userId);
  const user = db.prepare("SELECT id, email, name, college FROM users WHERE id = ?").get(req.userId);
  res.json({ user });
});

// PATCH /api/profile/onboarding  -- full career onboarding (step 5+)
router.patch("/onboarding", (req, res) => {
  const { branch, year, experience, interests, career_goal, daily_time } = req.body || {};
  if (!branch || !year || !experience || !career_goal) {
    return res.status(400).json({ error: "branch, year, experience and career_goal are required." });
  }
  db.prepare(
    `UPDATE profiles SET branch = ?, year = ?, experience = ?, interests = ?, career_goal = ?, daily_time = ?, onboarding_complete = 1
     WHERE user_id = ?`
  ).run(branch, year, experience, JSON.stringify(interests || []), career_goal, daily_time || "1 hour/day", req.userId);

  // Seed starter skills for the student based on interests, so the Skill
  // Tracker and Dashboard aren't empty on first login.
  const starter = starterSkillsForInterests(interests || []);
  const insert = db.prepare(
    `INSERT INTO user_skills (user_id, skill_id, status, progress) VALUES (?, ?, 'learning', 10)
     ON CONFLICT(user_id, skill_id) DO NOTHING`
  );
  const insertMany = db.transaction((ids) => ids.forEach((id) => insert.run(req.userId, id)));
  insertMany(starter);

  const careerId = careerIdForGoal(career_goal, interests || []);
  db.prepare(
    `INSERT INTO user_progress (user_id, key, value) VALUES (?, 'primary_career', ?)
     ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(req.userId, JSON.stringify({ careerId }));

  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);
  res.json({ profile: { ...profile, interests: JSON.parse(profile.interests || "[]") }, primaryCareerId: careerId });
});

// PATCH /api/profile  -- edit profile from the Account section
router.patch("/", (req, res) => {
  const { name, college, branch, year, experience, interests, career_goal, daily_time } = req.body || {};
  if (name !== undefined || college !== undefined) {
    db.prepare("UPDATE users SET name = COALESCE(?, name), college = COALESCE(?, college) WHERE id = ?").run(
      name, college, req.userId
    );
  }
  const current = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);
  db.prepare(
    `UPDATE profiles SET branch = ?, year = ?, experience = ?, interests = ?, career_goal = ?, daily_time = ? WHERE user_id = ?`
  ).run(
    branch ?? current.branch,
    year ?? current.year,
    experience ?? current.experience,
    interests !== undefined ? JSON.stringify(interests) : current.interests,
    career_goal ?? current.career_goal,
    daily_time ?? current.daily_time,
    req.userId
  );
  const user = db.prepare("SELECT id, email, name, college FROM users WHERE id = ?").get(req.userId);
  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);
  res.json({ user, profile: { ...profile, interests: JSON.parse(profile.interests || "[]") } });
});

export default router;
