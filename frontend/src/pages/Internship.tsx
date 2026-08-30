import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Card, ProgressBar } from "../components/ui";
import { api } from "../lib/api";

interface Readiness {
  github: boolean; resume: boolean; linkedin: boolean; portfolio: boolean; projects: boolean;
  dsa: boolean; communication: boolean; coreSubjects: boolean; interviewPrep: boolean;
}

const ITEMS: { key: keyof Readiness; label: string; group: "before" | "technical" | "application" }[] = [
  { key: "github", label: "GitHub with real, working projects", group: "before" },
  { key: "portfolio", label: "Portfolio site linking your work", group: "before" },
  { key: "linkedin", label: "LinkedIn profile is up to date", group: "before" },
  { key: "projects", label: "At least 2-3 solid projects", group: "before" },
  { key: "dsa", label: "Comfortable with core DSA", group: "technical" },
  { key: "coreSubjects", label: "Core subjects revised (DBMS/OS/CN)", group: "technical" },
  { key: "resume", label: "Resume tailored to your target role", group: "application" },
  { key: "communication", label: "Comfortable explaining your projects out loud", group: "application" },
  { key: "interviewPrep", label: "Practiced at least one mock interview", group: "application" },
];

const GROUPS: { key: "before" | "technical" | "application"; label: string }[] = [
  { key: "before", label: "Before Applying" },
  { key: "technical", label: "Technical Preparation" },
  { key: "application", label: "Application Preparation" },
];

export default function Internship() {
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    api.get<{ readiness: Readiness }>("/progress/readiness").then((d) => {
      setReadiness(d.readiness);
      setScore(computeScore(d.readiness));
    });
  }, []);

  async function toggle(key: keyof Readiness) {
    if (!readiness) return;
    const updated = { ...readiness, [key]: !readiness[key] };
    setReadiness(updated);
    setScore(computeScore(updated));
    try {
      const res = await api.patch<{ readiness: Readiness; score: number }>("/progress/readiness", { [key]: updated[key] });
      setReadiness(res.readiness);
      setScore(res.score);
    } catch { /* keep optimistic */ }
  }

  if (!readiness) return null;

  const improvements = ITEMS.filter((i) => !readiness[i.key]).slice(0, 3);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl">Internship Readiness</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">A concrete checklist — check off what's genuinely true.</p>
      </div>

      <Card className="text-center !py-8">
        <p className="text-xs uppercase tracking-wide text-white/40 [html.light_&]:text-ink-2/40 mb-1">Internship Readiness</p>
        <p className="font-display font-bold text-5xl text-growth-400">{score}%</p>
        <div className="max-w-xs mx-auto mt-4"><ProgressBar value={score} /></div>
      </Card>

      {GROUPS.map((g) => (
        <Card key={g.key}>
          <h3 className="font-display font-semibold text-sm mb-3">{g.label}</h3>
          <div className="space-y-2">
            {ITEMS.filter((i) => i.group === g.key).map((item) => {
              const checked = readiness[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-ink-border [html.light_&]:border-paper-border hover:border-white/20 text-left"
                >
                  <span className="text-sm">{item.label}</span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${checked ? "bg-growth-500 text-ink" : "bg-coral-500/12 text-coral-400"}`}>
                    {checked ? <Check size={12} /> : <X size={12} />}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      ))}

      {improvements.length > 0 && (
        <Card className="bg-amber-400/8 border-amber-400/25">
          <h3 className="font-display font-semibold text-sm mb-2 text-amber-400">What to improve next</h3>
          <ul className="space-y-1.5">
            {improvements.map((i) => <li key={i.key} className="text-sm text-white/70 [html.light_&]:text-ink-2/70">• {i.label}</li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}

function computeScore(r: Readiness) {
  const total = Object.keys(r).length;
  const done = Object.values(r).filter(Boolean).length;
  return Math.round((done / total) * 100);
}
