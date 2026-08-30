import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { recommendedProjects } from "../services/recommendationEngine.js";

const router = Router();

function parseProject(row) {
  return {
    ...row,
    technologies: JSON.parse(row.technologies),
    skills_learned: JSON.parse(row.skills_learned),
    features: JSON.parse(row.features),
    steps: JSON.parse(row.steps),
    career_tags: JSON.parse(row.career_tags),
  };
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM projects ORDER BY name").all();
  res.json({ projects: rows.map(parseProject) });
});

router.get("/recommended", requireAuth, (req, res) => {
  const progress = db.prepare("SELECT value FROM user_progress WHERE user_id = ? AND key = 'primary_career'").get(req.userId);
  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);
  const careerId = progress ? JSON.parse(progress.value).careerId : "software-developer";
  const projects = recommendedProjects({ careerId, experience: profile?.experience || "Beginner" });
  res.json({ projects, careerId });
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Project not found." });
  res.json({ project: parseProject(row) });
});

export default router;
