import { db, tableIsEmpty } from "./db.js";
import { careers } from "./data/careers.js";
import { skills } from "./data/skills.js";
import { resources } from "./data/resources.js";
import { projects } from "./data/projects.js";

function seedCareers() {
  if (!tableIsEmpty("careers")) return;
  const stmt = db.prepare(`
    INSERT INTO careers (id, name, description, what_you_do, difficulty, languages, skills, tools,
      typical_projects, roadmap_beginner, roadmap_intermediate, roadmap_advanced, internship_prep,
      interview_prep, match_traits)
    VALUES (@id, @name, @description, @what_you_do, @difficulty, @languages, @skills, @tools,
      @typical_projects, @roadmap_beginner, @roadmap_intermediate, @roadmap_advanced, @internship_prep,
      @interview_prep, @match_traits)
  `);
  const insertMany = db.transaction((rows) => {
    for (const c of rows) {
      stmt.run({
        id: c.id,
        name: c.name,
        description: c.description,
        what_you_do: c.what_you_do,
        difficulty: c.difficulty,
        languages: JSON.stringify(c.languages),
        skills: JSON.stringify(c.skills),
        tools: JSON.stringify(c.tools),
        typical_projects: JSON.stringify(c.typical_projects),
        roadmap_beginner: JSON.stringify(c.roadmap_beginner),
        roadmap_intermediate: JSON.stringify(c.roadmap_intermediate),
        roadmap_advanced: JSON.stringify(c.roadmap_advanced),
        internship_prep: JSON.stringify(c.internship_prep),
        interview_prep: JSON.stringify(c.interview_prep),
        match_traits: JSON.stringify(c.match_traits),
      });
    }
  });
  insertMany(careers);
  console.log(`Seeded ${careers.length} careers`);
}

function seedSkills() {
  if (!tableIsEmpty("skills")) return;
  const stmt = db.prepare(`INSERT INTO skills (id, name, category) VALUES (@id, @name, @category)`);
  const insertMany = db.transaction((rows) => rows.forEach((r) => stmt.run(r)));
  insertMany(skills);
  console.log(`Seeded ${skills.length} skills`);
}

function seedResources() {
  if (!tableIsEmpty("resources")) return;
  const stmt = db.prepare(`
    INSERT INTO resources (id, title, platform, topic, difficulty, free, duration, description, link, why)
    VALUES (@id, @title, @platform, @topic, @difficulty, @free, @duration, @description, @link, @why)
  `);
  const insertMany = db.transaction((rows) => rows.forEach((r) => stmt.run(r)));
  insertMany(resources);
  console.log(`Seeded ${resources.length} resources`);
}

function seedProjects() {
  if (!tableIsEmpty("projects")) return;
  const stmt = db.prepare(`
    INSERT INTO projects (id, name, difficulty, technologies, skills_learned, description, features,
      steps, outcome, portfolio_value, career_tags)
    VALUES (@id, @name, @difficulty, @technologies, @skills_learned, @description, @features,
      @steps, @outcome, @portfolio_value, @career_tags)
  `);
  const insertMany = db.transaction((rows) => {
    for (const p of rows) {
      stmt.run({
        id: p.id,
        name: p.name,
        difficulty: p.difficulty,
        technologies: JSON.stringify(p.technologies),
        skills_learned: JSON.stringify(p.skills_learned),
        description: p.description,
        features: JSON.stringify(p.features),
        steps: JSON.stringify(p.steps),
        outcome: p.outcome,
        portfolio_value: p.portfolio_value,
        career_tags: JSON.stringify(p.career_tags),
      });
    }
  });
  insertMany(projects);
  console.log(`Seeded ${projects.length} projects`);
}

export function runSeed() {
  seedCareers();
  seedSkills();
  seedResources();
  seedProjects();
}

// Allow running directly: `npm run seed`
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  runSeed();
  console.log("Seed complete.");
}
