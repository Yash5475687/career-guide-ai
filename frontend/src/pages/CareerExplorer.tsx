import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle, Scale } from "lucide-react";
import { Card, LoadingState, Pill, Button } from "../components/ui";
import { api } from "../lib/api";
import type { Career } from "../lib/types";

export default function CareerExplorer() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  useEffect(() => {
    api.get<{ careers: Career[] }>("/careers").then((d) => setCareers(d.careers)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading careers…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Career Explorer</h1>
          <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Browse career paths and see exactly what each one takes.</p>
        </div>
        <Link to="/app/careers/quiz">
          <Button variant="secondary" size="sm"><HelpCircle size={15} /> Not sure? Take the quiz</Button>
        </Link>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} className="text-sky-400" />
          <h3 className="font-display font-semibold text-sm">Compare two careers</h3>
        </div>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
          <select value={compareA} onChange={(e) => setCompareA(e.target.value)} className="bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-3 py-2.5 text-sm outline-none">
            <option value="">Select a career…</option>
            {careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={compareB} onChange={(e) => setCompareB(e.target.value)} className="bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-3 py-2.5 text-sm outline-none">
            <option value="">Select another career…</option>
            {careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Link to={compareA && compareB ? `/app/careers/compare/${compareA}/${compareB}` : "#"}>
            <Button disabled={!compareA || !compareB} className="w-full sm:w-auto">Compare</Button>
          </Link>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {careers.map((c) => (
          <Link key={c.id} to={`/app/careers/${c.id}`}>
            <Card className="h-full hover:border-growth-500/40 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold">{c.name}</h3>
                <Pill tone="sky">{c.difficulty}</Pill>
              </div>
              <p className="text-sm text-white/55 [html.light_&]:text-ink-2/55 mb-3">{c.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {c.languages.slice(0, 4).map((l) => <Pill key={l}>{l}</Pill>)}
              </div>
              <span className="text-xs text-growth-400 flex items-center gap-1">Explore path <ArrowRight size={12} /></span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
