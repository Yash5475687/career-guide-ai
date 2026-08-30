import { useEffect, useMemo, useState } from "react";
import { Card, LoadingState, ProgressBar } from "../components/ui";
import { api } from "../lib/api";
import type { SkillRow } from "../lib/types";

const STATUS_OPTIONS: SkillRow["status"][] = ["not_started", "learning", "practicing", "completed"];
const STATUS_LABEL: Record<SkillRow["status"], string> = {
  not_started: "Not Started", learning: "Learning", practicing: "Practicing", completed: "Completed",
};

export default function Skills() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ skills: SkillRow[] }>("/skills/mine").then((d) => setSkills(d.skills)).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, SkillRow[]>();
    for (const s of skills) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return map;
  }, [skills]);

  const overall = skills.length ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length) : 0;

  async function updateSkill(id: string, patch: Partial<Pick<SkillRow, "status" | "progress">>) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    try {
      await api.patch(`/skills/${id}`, patch);
    } catch { /* keep optimistic state */ }
  }

  if (loading) return <LoadingState label="Loading your skills…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Skill Tracker</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Overall progress: {overall}%</p>
        <div className="max-w-sm mt-2"><ProgressBar value={overall} /></div>
      </div>

      {[...grouped.entries()].map(([category, items]) => (
        <div key={category}>
          <h2 className="font-display font-semibold text-sm text-white/60 [html.light_&]:text-ink-2/60 mb-3">{category}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((s) => (
              <Card key={s.id} className="!p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  <select
                    value={s.status}
                    onChange={(e) => updateSkill(s.id, { status: e.target.value as SkillRow["status"], progress: e.target.value === "completed" ? 100 : s.progress })}
                    className="bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-lg text-xs px-2 py-1 outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{STATUS_LABEL[opt]}</option>)}
                  </select>
                </div>
                <ProgressBar value={s.progress} tone={s.status === "completed" ? "growth" : "sky"} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.progress}
                  onChange={(e) => updateSkill(s.id, { progress: Number(e.target.value) })}
                  aria-label={`${s.name} progress`}
                  className="w-full mt-2 accent-growth-500"
                />
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
