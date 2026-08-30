import { Router } from "express";
import { getAllCareers, getCareer } from "../services/recommendationEngine.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ careers: getAllCareers() });
});

router.get("/:id", (req, res) => {
  const career = getCareer(req.params.id);
  if (!career) return res.status(404).json({ error: "Career not found." });
  res.json({ career });
});

router.get("/:id/compare/:otherId", (req, res) => {
  const a = getCareer(req.params.id);
  const b = getCareer(req.params.otherId);
  if (!a || !b) return res.status(404).json({ error: "One or both careers not found." });
  res.json({ a, b });
});

export default router;
