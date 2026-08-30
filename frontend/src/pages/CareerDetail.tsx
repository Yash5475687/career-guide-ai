import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Briefcase, Wrench, Rocket, GraduationCap } from "lucide-react";
import { Card, LoadingState, Pill, EmptyState } from "../components/ui";
import { api } from "../lib/api";
import type { Career } from "../lib/types";

export default function CareerDetail() {
  const { id } = useParams();
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<{ career: Career }>(`/careers/${id}`).then((d) => setCareer(d.career)).catch(() => setCareer(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState label="Loading career details…" />;
  if (!career) return <EmptyState title="Career not found" description="This career path doesn't exist." action={<Link to="/app/careers" className="text-sm text-growth-400 mt-2">Back to Career Explorer</Link>} />;

  return (
    <div className="space-y-6">
      <Link to="/app/careers" className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 [html.light_&]:text-ink-2/50"><ArrowLeft size={14} /> Career Explorer</Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="font-display font-bold text-2xl">{career.name}</h1>
          <Pill tone="sky">{career.difficulty}</Pill>
        </div>
        <p className="text-white/60 [html.light_&]:text-ink-2/60">{career.description}</p>
      </div>

      <Card>
        <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2"><Briefcase size={15} className="text-growth-400" /> What You Do</h3>
        <p className="text-sm text-white/60 [html.light_&]:text-ink-2/60">{career.what_you_do}</p>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        <TagCard title="Languages" items={career.languages} />
        <TagCard title="Skills" items={career.skills} />
        <TagCard title="Tools" items={career.tools} />
      </div>

      <Card>
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2"><Rocket size={15} className="text-coral-400" /> Typical Projects</h3>
        <ul className="grid sm:grid-cols-2 gap-2">
          {career.typical_projects.map((p) => <li key={p} className="text-sm text-white/60 [html.light_&]:text-ink-2/60 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-growth-400 shrink-0" />{p}</li>)}
        </ul>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2"><GraduationCap size={15} className="text-sky-400" /> Roadmap</h3>
        <div className="grid sm:grid-cols-3 gap-5">
          <RoadmapPhase label="Beginner" items={career.roadmap_beginner} tone="growth" />
          <RoadmapPhase label="Intermediate" items={career.roadmap_intermediate} tone="sky" />
          <RoadmapPhase label="Advanced" items={career.roadmap_advanced} tone="amber" />
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2"><Wrench size={15} className="text-growth-400" /> Internship Preparation</h3>
          <ul className="space-y-1.5">
            {career.internship_prep.map((p) => <li key={p} className="text-sm text-white/60 [html.light_&]:text-ink-2/60">• {p}</li>)}
          </ul>
        </Card>
        <Card>
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2"><Wrench size={15} className="text-amber-400" /> Interview Preparation</h3>
          <ul className="space-y-1.5">
            {career.interview_prep.map((p) => <li key={p} className="text-sm text-white/60 [html.light_&]:text-ink-2/60">• {p}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function TagCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h4 className="text-xs uppercase tracking-wide text-white/40 [html.light_&]:text-ink-2/40 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1.5">{items.map((i) => <Pill key={i}>{i}</Pill>)}</div>
    </Card>
  );
}

function RoadmapPhase({ label, items, tone }: { label: string; items: string[]; tone: "growth" | "sky" | "amber" }) {
  return (
    <div>
      <Pill tone={tone}>{label}</Pill>
      <ol className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={item} className="text-sm text-white/60 [html.light_&]:text-ink-2/60 flex gap-2">
            <span className="font-mono text-xs text-white/30 [html.light_&]:text-ink-2/30 shrink-0">{String(i + 1).padStart(2, "0")}</span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}
