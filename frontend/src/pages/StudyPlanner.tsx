import { useEffect, useState } from "react";
import { Plus, Trash2, Flame, Check } from "lucide-react";
import { Card, Button } from "../components/ui";
import { api } from "../lib/api";

interface Block { id: string; label: string; start: string; end: string; }
interface StudyPlan { blocks: Block[]; streak: number; lastCompletedDate: string | null; completedDates: string[]; }

export default function StudyPlanner() {
  const [plan, setPlan] = useState<StudyPlan>({ blocks: [], streak: 0, lastCompletedDate: null, completedDates: [] });
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("19:00");

  useEffect(() => {
    api.get<{ studyPlan: StudyPlan }>("/progress/study-plan").then((d) => setPlan(d.studyPlan)).finally(() => setLoading(false));
  }, []);

  async function saveBlocks(blocks: Block[]) {
    setPlan((p) => ({ ...p, blocks }));
    try {
      const res = await api.put<{ studyPlan: StudyPlan }>("/progress/study-plan", { blocks });
      setPlan(res.studyPlan);
    } catch { /* keep optimistic */ }
  }

  function addBlock() {
    if (!label.trim()) return;
    const block: Block = { id: crypto.randomUUID(), label, start, end };
    saveBlocks([...plan.blocks, block].sort((a, b) => a.start.localeCompare(b.start)));
    setLabel("");
  }

  function removeBlock(id: string) {
    saveBlocks(plan.blocks.filter((b) => b.id !== id));
  }

  async function markToday() {
    const res = await api.post<{ studyPlan: StudyPlan }>("/progress/study-plan/complete-today");
    setPlan(res.studyPlan);
  }

  const today = new Date().toISOString().slice(0, 10);
  const doneToday = plan.lastCompletedDate === today;

  if (loading) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Daily Study Planner</h1>
          <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Consistency beats intensity — build your schedule and your streak.</p>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400 shrink-0">
          <Flame size={20} />
          <span className="font-display font-semibold">{plan.streak}</span>
        </div>
      </div>

      <Card>
        <h3 className="font-display font-semibold text-sm mb-3">Today's Blocks</h3>
        {plan.blocks.length === 0 ? (
          <p className="text-sm text-white/40 [html.light_&]:text-ink-2/40">No blocks yet — add your first study block below.</p>
        ) : (
          <ul className="space-y-2">
            {plan.blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-ink-border [html.light_&]:border-paper-border">
                <div>
                  <p className="text-sm font-medium">{b.label}</p>
                  <p className="text-xs text-white/40 [html.light_&]:text-ink-2/40 font-mono">{b.start} – {b.end}</p>
                </div>
                <button onClick={() => removeBlock(b.id)} aria-label={`Remove ${b.label}`} className="text-white/30 hover:text-coral-400">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Python" className="flex-1 min-w-[120px] bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-3 py-2 text-sm outline-none" />
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-3 py-2 text-sm outline-none" />
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-3 py-2 text-sm outline-none" />
          <Button onClick={addBlock} size="sm"><Plus size={14} /> Add</Button>
        </div>
      </Card>

      <Card className={doneToday ? "border-growth-500/40 bg-growth-500/8" : ""}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-sm">{doneToday ? "Marked complete for today" : "Finished today's plan?"}</h3>
            <p className="text-xs text-white/40 [html.light_&]:text-ink-2/40 mt-0.5">Mark it done to keep your streak alive.</p>
          </div>
          <Button onClick={markToday} disabled={doneToday} variant={doneToday ? "secondary" : "primary"} size="sm">
            {doneToday ? <><Check size={14} /> Done</> : "Mark Complete"}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-sm mb-3">Recent Activity</h3>
        <div className="flex flex-wrap gap-1.5">
          {(plan.completedDates || []).slice(-30).map((d) => (
            <span key={d} title={d} className="w-6 h-6 rounded bg-growth-500/60" />
          ))}
          {(!plan.completedDates || plan.completedDates.length === 0) && (
            <p className="text-sm text-white/40 [html.light_&]:text-ink-2/40">No completed days yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
