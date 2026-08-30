// AI Mentor provider abstraction.
//
// If ANTHROPIC_API_KEY is set, questions are sent to Claude with the
// student's profile as context. If it is not set (the default), a
// realistic rule-based fallback answers common question patterns so the
// feature still works with zero configuration. The API key is only ever
// read here, server-side — it is never sent to or reachable from the
// frontend.

const SYSTEM_PROMPT = `You are the AI Career Mentor inside Career Guide AI, a platform that helps
engineering students plan their learning and career. Give concise, encouraging,
concrete advice grounded in the student's profile. Prefer a short list of next
steps over a long essay. Never guarantee job offers or salaries.`;

export async function askMentor({ profile, question, history = [] }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system: `${SYSTEM_PROMPT}\n\nStudent profile: ${JSON.stringify(profile)}`,
          messages: [...history, { role: "user", content: question }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("\n").trim();
      if (text) return { answer: text, source: "ai" };
    } catch (err) {
      console.warn("AI mentor live call failed, falling back to rule-based answer:", err.message);
    }
  }
  return { answer: fallbackAnswer({ profile, question }), source: "fallback" };
}

function fallbackAnswer({ profile, question }) {
  const q = (question || "").toLowerCase();
  const name = profile?.name || "there";
  const goal = profile?.career_goal || "your goal";
  const experience = profile?.experience || "Beginner";
  const dailyTime = profile?.daily_time || "1 hour/day";

  if (/java\s*or\s*python|python\s*or\s*java/.test(q)) {
    return `Both are solid, but for most first-year students I'd start with Python — the syntax is simpler, so you spend less time fighting the language and more time learning concepts. It's also directly useful for AI, scripting, cybersecurity and backend work. Learn Java later if a specific goal (e.g. Android, enterprise backend) calls for it.`;
  }
  if (/after python|next.*python|what.*learn.*after/.test(q)) {
    return `Great question. After Python fundamentals, most students benefit from:\n1. Git & GitHub — start version-controlling everything you build\n2. One specialization path aligned to "${goal}"\n3. A first real project (not a tutorial clone) using what you just learned\n4. Basic SQL — almost every path eventually needs it`;
  }
  if (/study plan|daily plan|schedule/.test(q)) {
    return `Here's a simple structure for ${dailyTime}:\n- 50% on core learning (a course or documentation, one topic at a time)\n- 30% on applying it in a small project\n- 20% on review — DSA practice or revisiting a tricky concept\nConsistency beats intensity: 1 focused hour daily outperforms an occasional 6-hour binge.`;
  }
  if (/project/.test(q)) {
    return `Based on your profile (${experience.toLowerCase()}, aiming for ${goal}), pick one project that's slightly harder than what feels comfortable. Check the Project Recommender tab — it's already filtered to your career goal and experience level. Finish one project fully (including a README) before starting the next.`;
  }
  if (/internship/.test(q)) {
    return `To get internship-ready: (1) have 2-3 real projects on GitHub with clear READMEs, (2) be comfortable explaining your code in an interview, (3) know the fundamentals for your track (DSA for most roles, networking/OWASP for security). Check the Internship Readiness tab for a personalized checklist.`;
  }
  if (/ready.*dsa|start.*dsa/.test(q)) {
    return `If you're comfortable with variables, loops, functions, arrays and basic OOP, you're ready to start DSA. Start with arrays, strings and hashmaps before moving to trees/graphs — don't try to learn everything at once.`;
  }
  if (/placement|interview prep|prepare for placement/.test(q)) {
    return `Placement prep usually has three tracks running in parallel: (1) DSA practice (a little every day, not cramming), (2) core subject revision relevant to your track, (3) mock interviews and a polished resume. Start all three at least 2-3 months out.`;
  }
  if (/career.*suitable|which career|what career/.test(q)) {
    return `Hi ${name} — the Career Explorer and the "I Don't Know What I Want" quiz are built for exactly this. Based on what's in your profile so far, "${goal}" looks like a reasonable direction, but try the quiz if you want a broader comparison across paths.`;
  }
  return `Good question. Based on your profile — ${experience} level, aiming for ${goal} — my general advice is: focus on one skill at a time, build something small every 1-2 weeks, and keep your GitHub updated. Ask me something more specific (e.g. "what should I learn after Python?" or "create a study plan for 2 hours a day") and I can get more concrete.`;
}
