import { db } from "../db.js";

// Rule-based recommendation engine.
//
// This is intentionally simple and transparent (if/else + scoring rules)
// so it is easy to explain to a student ("why was this recommended?") and
// easy to later replace with a real ML/AI-driven engine — every function
// here returns plain data, so swapping the internals doesn't change the
// API contract consumed by the frontend.

function parseCareer(row) {
  return {
    ...row,
    languages: JSON.parse(row.languages),
    skills: JSON.parse(row.skills),
    tools: JSON.parse(row.tools),
    typical_projects: JSON.parse(row.typical_projects),
    roadmap_beginner: JSON.parse(row.roadmap_beginner),
    roadmap_intermediate: JSON.parse(row.roadmap_intermediate),
    roadmap_advanced: JSON.parse(row.roadmap_advanced),
    internship_prep: JSON.parse(row.internship_prep),
    interview_prep: JSON.parse(row.interview_prep),
    match_traits: JSON.parse(row.match_traits),
  };
}

export function getAllCareers() {
  return db.prepare("SELECT * FROM careers ORDER BY name").all().map(parseCareer);
}

export function getCareer(id) {
  const row = db.prepare("SELECT * FROM careers WHERE id = ?").get(id);
  return row ? parseCareer(row) : null;
}

// IF interest + experience THEN recommend a starter skill set.
// This directly implements the spec's example rule (interest=cybersecurity,
// experience=beginner -> Python, Linux, Networking, Git, security fundamentals).
const INTEREST_STARTER_SKILLS = {
  "Web Development": ["git", "javascript", "react", "nodejs"],
  "App Development": ["dart", "mobile-dev", "git", "rest-apis"],
  "AI/ML": ["python", "math-ml", "ml", "statistics"],
  "Cybersecurity": ["python", "linux", "networks", "git", "web-security"],
  "Data Science": ["python", "sql", "statistics", "data-viz"],
  "Cloud Computing": ["linux", "networks", "cloud", "bash"],
  "DevOps": ["linux", "docker", "cicd", "bash"],
  "Blockchain": ["javascript", "solidity", "cryptography"],
  "Software Development": ["python", "dsa", "git", "sql"],
  "Game Development": ["csharp", "game-dev", "dsa"],
  "UI/UX": ["figma", "javascript"],
  "Networking": ["networks", "linux", "network-security"],
  "Embedded Systems": ["cpp", "os"],
  "Robotics": ["cpp", "python", "math-ml"],
  "Entrepreneurship": ["communication", "javascript"],
  "Competitive Programming": ["dsa", "cpp", "competitive-programming"],
};

export function starterSkillsForInterests(interests = []) {
  const ids = new Set();
  for (const interest of interests) {
    (INTEREST_STARTER_SKILLS[interest] || []).forEach((id) => ids.add(id));
  }
  if (ids.size === 0) ["git", "python", "dsa"].forEach((id) => ids.add(id));
  return [...ids];
}

// Career goal -> career id mapping used to select a primary roadmap.
const GOAL_TO_CAREER = {
  "Software Developer": "software-developer",
  "Cybersecurity Engineer": "cybersecurity-engineer",
  "AI Engineer": "ai-ml-engineer",
  "Data Scientist": "data-scientist",
  "Cloud Engineer": "cloud-engineer",
  "DevOps Engineer": "devops-engineer",
  "Full Stack Developer": "full-stack-developer",
  "Mobile Developer": "mobile-developer",
  "Researcher": "ai-ml-engineer",
  "Entrepreneur": "full-stack-developer",
  "Government/Defence Tech Career": "cybersecurity-engineer",
};

export function careerIdForGoal(goal, interests = []) {
  if (GOAL_TO_CAREER[goal]) return GOAL_TO_CAREER[goal];
  // "Not Sure Yet" -> fall back to first matching interest, else software-developer
  const interestToCareer = {
    Cybersecurity: "cybersecurity-engineer",
    "AI/ML": "ai-ml-engineer",
    "Data Science": "data-scientist",
    "Cloud Computing": "cloud-engineer",
    DevOps: "devops-engineer",
    "Web Development": "full-stack-developer",
    "App Development": "mobile-developer",
    "Game Development": "game-developer",
    Blockchain: "blockchain-developer",
  };
  for (const interest of interests) {
    if (interestToCareer[interest]) return interestToCareer[interest];
  }
  return "software-developer";
}

export function recommendedProjects({ careerId, experience }) {
  const all = db.prepare("SELECT * FROM projects").all().map((p) => ({
    ...p,
    technologies: JSON.parse(p.technologies),
    skills_learned: JSON.parse(p.skills_learned),
    features: JSON.parse(p.features),
    steps: JSON.parse(p.steps),
    career_tags: JSON.parse(p.career_tags),
  }));
  const difficultyRank = { Beginner: 0, "Beginner-Intermediate": 1, Intermediate: 2, "Intermediate-Advanced": 3, Advanced: 4 };
  const expRank = { "Complete Beginner": 0, Beginner: 0, Intermediate: 2, Advanced: 3 };
  const targetRank = expRank[experience] ?? 0;

  return all
    .filter((p) => p.career_tags.includes(careerId))
    .sort((a, b) => Math.abs((difficultyRank[a.difficulty] ?? 2) - targetRank) - Math.abs((difficultyRank[b.difficulty] ?? 2) - targetRank))
    .slice(0, 6);
}

// "I don't know what career I want" quiz scoring.
// Weighted trait match against each career's match_traits. Presented to the
// student explicitly as guidance, not a scientific determination.
export function scoreCareerQuiz(answers) {
  // answers: { enjoysCoding, enjoysMath, enjoysNetworking, enjoysBuilding,
  //            enjoysResearch, enjoysBusiness, teamPreference }  each boolean/string
  const traitsPresent = [];
  if (answers.enjoysCoding) traitsPresent.push("coding");
  if (answers.enjoysMath) traitsPresent.push("mathematics");
  if (answers.enjoysNetworking) traitsPresent.push("networking");
  if (answers.enjoysBuilding) traitsPresent.push("building");
  if (answers.enjoysResearch) traitsPresent.push("research");
  if (answers.enjoysBusiness) traitsPresent.push("communication");
  if (answers.teamPreference === "team") traitsPresent.push("team");
  if (answers.teamPreference === "individual") traitsPresent.push("individual_or_team");

  const careers = getAllCareers();
  const scored = careers.map((c) => {
    const overlap = c.match_traits.filter((t) => traitsPresent.includes(t)).length;
    const pct = Math.min(95, Math.round((overlap / Math.max(2, c.match_traits.length)) * 100) + 20);
    return { career: c, matchPercent: overlap === 0 ? 30 : pct };
  });
  scored.sort((a, b) => b.matchPercent - a.matchPercent);
  return scored.slice(0, 3);
}
