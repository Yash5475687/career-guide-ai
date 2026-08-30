import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ careers: [], skills: [], resources: [], projects: [] });
  const like = `%${q}%`;

  const careers = db.prepare("SELECT id, name, description FROM careers WHERE name LIKE ? OR description LIKE ? LIMIT 5").all(like, like);
  const skills = db.prepare("SELECT id, name, category FROM skills WHERE name LIKE ? LIMIT 5").all(like);
  const resources = db.prepare("SELECT id, title, platform, topic, link FROM resources WHERE title LIKE ? OR topic LIKE ? LIMIT 5").all(like, like);
  const projects = db.prepare("SELECT id, name, difficulty FROM projects WHERE name LIKE ? OR description LIKE ? LIMIT 5").all(like, like);

  res.json({ careers, skills, resources, projects });
});

export default router;
