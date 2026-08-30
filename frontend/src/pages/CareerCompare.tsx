import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, LoadingState, Pill } from "../components/ui";
import { api } from "../lib/api";
import type { Career } from "../lib/types";

const ROWS: { label: string; key: keyof Career }[] = [
  { label: "Difficulty", key: "difficulty" },
  { label: "Languages", key: "languages" },
  { label: "Skills", key: "skills" },
  { label: "Tools", key: "tools" },
  { label: "Typical Projects", key: "typical_projects" },
];

export default function CareerCompare() {
  const { idA, idB } = useParams();
  const [a, setA] = useState<Career | null>(null);
  const [b, setB] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idA || !idB) return;
    api.get<{ a: Career; b: Career }>(`/careers/${idA}/compare/${idB}`).then((d) => { setA(d.a); setB(d.b); }).finally(() => setLoading(false));
  }, [idA, idB]);

  if (loading) return <LoadingState label="Comparing careers…" />;
  if (!a || !b) return <p className="text-sm text-white/50">Couldn't load this comparison.</p>;

  return (
    <div className="space-y-6">
      <Link to="/app/careers" className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 [html.light_&]:text-ink-2/50"><ArrowLeft size={14} /> Career Explorer</Link>
      <h1 className="font-display font-bold text-2xl">{a.name} vs {b.name}</h1>
      <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50">
        A balanced side-by-side comparison — not a ranking. Both are viable paths; pick based on what you enjoy.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {[a, b].map((c) => (
          <Card key={c.id}>
            <h3 className="font-display font-semibold">{c.name}</h3>
            <p className="text-sm text-white/55 [html.light_&]:text-ink-2/55 mt-1">{c.description}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 [html.light_&]:text-ink-2/40 text-xs uppercase">
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">{a.name}</th>
              <th className="pb-3">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-ink-border [html.light_&]:border-paper-border align-top">
                <td className="py-3 pr-4 font-medium text-white/70 [html.light_&]:text-ink-2/70 whitespace-nowrap">{row.label}</td>
                <td className="py-3 pr-4">{renderCell(a[row.key])}</td>
                <td className="py-3">{renderCell(b[row.key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function renderCell(value: Career[keyof Career]) {
  if (Array.isArray(value)) {
    return <div className="flex flex-wrap gap-1.5">{value.map((v) => <Pill key={v}>{v}</Pill>)}</div>;
  }
  return <span>{String(value)}</span>;
}
