import { Router } from "express";
import { scoreCareerQuiz } from "../services/recommendationEngine.js";

const router = Router();

// POST /api/quiz/career-discovery
// body: { enjoysCoding, enjoysMath, enjoysNetworking, enjoysBuilding,
//         enjoysResearch, enjoysBusiness, teamPreference }
router.post("/career-discovery", (req, res) => {
  const results = scoreCareerQuiz(req.body || {});
  res.json({
    results: results.map((r) => ({
      careerId: r.career.id,
      name: r.career.name,
      description: r.career.description,
      matchPercent: r.matchPercent,
    })),
    disclaimer:
      "This is guidance based on your answers, not a scientific determination of your best career. Explore a few options before committing.",
  });
});

export default router;
