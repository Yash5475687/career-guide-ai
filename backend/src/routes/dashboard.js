import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getCareer } from "../services/recommendationEngine.js";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const user = db.prepare("SELECT id, name, email, college FROM users WHERE id = ?").get(req.userId);
  const profileRow = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);
  const profile = profileRow ? { ...profileRow, interests: JSON.parse(profileRow.interests || "[]") } : null;

  const progressRow = db.prepare("SELECT value FROM user_progress WHERE user_id = ? AND key = 'primary_career'").get(req.userId);
  const careerId = progressRow ? JSON.parse(progressRow.value).careerId : null;
  const career = careerId ? getCareer(careerId) : null;

  const userSkills = db.prepare(
    `SELECT s.id, s.name, s.category, us.status, us.progress
     FROM user_skills us JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = ? ORDER BY us.updated_at DESC`
  ).all(req.userId);

  const overallProgress = userSkills.length
    ? Math.round(userSkills.reduce((sum, s) => sum + s.progress, 0) / userSkills.length)
    : 0;

  // "Next step" — the in-progress skill with the lowest progress, or the
  // first not-started skill, else a generic prompt to start onboarding.
  let nextStep = null;
  const inProgress = userSkills.filter((s) => s.status === "learning" || s.status === "practicing");
  if (inProgress.length) {
    const target = inProgress.sort((a, b) => a.progress - b.progress)[0];
    nextStep = {
      title: `Continue ${target.name}`,
      progress: target.progress,
      why: career
        ? `${target.name} is part of the skill set for ${career.name}.`
        : `${target.name} is one of your active skills.`,
      skillId: target.id,
    };
  } else if (career) {
    nextStep = {
      title: `Start with ${career.roadmap_beginner[0] || career.skills[0]}`,
      progress: 0,
      why: `This is the first step on the ${career.name} roadmap.`,
      skillId: null,
    };
  }

  const readinessRow = db.prepare("SELECT value FROM user_progress WHERE user_id = ? AND key = 'readiness_checklist'").get(req.userId);
  const readiness = readinessRow ? JSON.parse(readinessRow.value) : {};
  const readinessDone = Object.values(readiness).filter(Boolean).length;
  const readinessTotal = 9;

  const studyRow = db.prepare("SELECT value FROM user_progress WHERE user_id = ? AND key = 'study_plan'").get(req.userId);
  const streak = studyRow ? JSON.parse(studyRow.value).streak || 0 : 0;

  res.json({
    user,
    profile,
    primaryCareer: career,
    overallProgress,
    nextStep,
    skills: userSkills,
    streak,
    readinessScore: Math.round((readinessDone / readinessTotal) * 100),
    upcomingGoals: career ? career.roadmap_beginner.slice(0, 4) : [],
  });
});

export default router;
