import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Card, LoadingState, EmptyState } from "../components/ui";
import { api } from "../lib/api";
import type { Career } from "../lib/types";

interface RoadmapData { completed: string[]; }

const YEAR_FOCUS = [
  { year: "Year 1", label: "Foundation", items: ["Programming Basics", "Git & GitHub", "Computer Fundamentals", "Linux", "Basic Projects"] },
  { year: "Year 2", label: "Specialization", items: ["Advanced Programming", "Core Technologies", "Projects", "Open Source"] },
  { year: "Year 3", label: "Industry Preparation", items: ["Advanced Projects", "Internships", "DSA", "System Design Basics"] },
  { year: "Year 4", label: "Career", items: ["Resume", "Interview Preparation", "Placements", "Job Applications"] },
];

export default function Roadmap() {
  const [career, setCareer] = useState<Career | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ primaryCareer: Career | null }>("/dashboard"),
      api.get<{ roadmap: RoadmapData }>("/progress/roadmap"),
    ])
      .then(([dashRes, progressRes]) => {
        setCareer(dashRes.primaryCareer);
        setCompleted(new Set(progressRes.roadmap.completed));
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggle(id: string) {
    const next = new Set(completed);
    next.has(id) ? next.delete(id) : next.add(id);
    setCompleted(next);
    try {
      const res = await api.post<{ roadmap: RoadmapData }>("/progress/roadmap/toggle", { milestoneId: id });
      setCompleted(new Set(res.roadmap.completed));
    } catch { /* keep optimistic state */ }
  }

  if (loading) return <LoadingState label="Loading your roadmap…" />;

  const totalItems = YEAR_FOCUS.reduce((s, y) => s + y.items.length, 0);
  const doneCount = completed.size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Your 4-Year Roadmap</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">
          {career ? `Tailored around your goal: ${career.name}. ` : ""}Click any milestone to mark it complete — {doneCount}/{totalItems} done.
        </p>
      </div>

      {career && (
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-wide text-white/40 [html.light_&]:text-ink-2/40 mb-2">Career-specific path</p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <RoadmapMini label="Beginner" items={career.roadmap_beginner} />
            <RoadmapMini label="Intermediate" items={career.roadmap_intermediate} />
            <RoadmapMini label="Advanced" items={career.roadmap_advanced} />
          </div>
        </Card>
      )}

      <div className="relative pl-8">
        <div className="absolute left-[13px] top-2 bottom-2 w-0.5 trail-line rounded-full" aria-hidden="true" />
        <div className="space-y-8">
          {YEAR_FOCUS.map((y) => (
            <div key={y.year} className="relative">
              <div className="absolute -left-8 top-0 w-7 h-7 rounded-full bg-ink-2 [html.light_&]:bg-white border-2 border-growth-500 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-growth-500" />
              </div>
              <Card>
                <div className="flex items-baseline gap-2 mb-3">
                  <h3 className="font-display font-semibold">{y.year}</h3>
                  <span className="text-xs text-white/40 [html.light_&]:text-ink-2/40">{y.label}</span>
                </div>
                <div className="space-y-2">
                  {y.items.map((item) => {
                    const id = `${y.year}:${item}`;
                    const isDone = completed.has(id);
                    return (
                      <button
                        key={item}
                        onClick={() => toggle(id)}
                        className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl border transition-colors ${
                          isDone ? "border-growth-500/40 bg-growth-500/8" : "border-ink-border [html.light_&]:border-paper-border hover:border-white/20"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDone ? "bg-growth-500 text-ink" : "border border-white/20 [html.light_&]:border-ink/20"}`}>
                          {isDone && <Check size={12} />}
                        </span>
                        <span className={`text-sm ${isDone ? "line-through text-white/40 [html.light_&]:text-ink-2/40" : ""}`}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {!career && (
        <EmptyState title="No career goal set yet" description="Complete onboarding to get a career-specific roadmap layered on top of the general timeline." />
      )}
    </div>
  );
}

function RoadmapMini({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-growth-400 font-medium mb-1.5">{label}</p>
      <ul className="space-y-1 text-white/60 [html.light_&]:text-ink-2/60">
        {items.slice(0, 3).map((i) => <li key={i}>• {i}</li>)}
      </ul>
    </div>
  );
}
