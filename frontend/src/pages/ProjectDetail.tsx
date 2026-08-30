import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, LoadingState, Pill, EmptyState } from "../components/ui";
import { api } from "../lib/api";
import type { ProjectItem } from "../lib/types";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<{ project: ProjectItem }>(`/projects/${id}`).then((d) => setProject(d.project)).catch(() => setProject(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState label="Loading project…" />;
  if (!project) return <EmptyState title="Project not found" description="This project doesn't exist." action={<Link to="/app/projects" className="text-sm text-growth-400 mt-2">Back to Projects</Link>} />;

  return (
    <div className="space-y-6">
      <Link to="/app/projects" className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 [html.light_&]:text-ink-2/50"><ArrowLeft size={14} /> Projects</Link>

      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="font-display font-bold text-2xl">{project.name}</h1>
        <Pill tone="amber">{project.difficulty}</Pill>
      </div>
      <p className="text-white/60 [html.light_&]:text-ink-2/60">{project.description}</p>

      <div className="flex flex-wrap gap-1.5">{project.technologies.map((t) => <Pill key={t} tone="sky">{t}</Pill>)}</div>

      <Card>
        <h3 className="font-display font-semibold text-sm mb-3">Features</h3>
        <ul className="grid sm:grid-cols-2 gap-2">
          {project.features.map((f) => <li key={f} className="text-sm text-white/60 [html.light_&]:text-ink-2/60 flex gap-2"><span className="w-1 h-1 rounded-full bg-growth-400 mt-2 shrink-0" />{f}</li>)}
        </ul>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-sm mb-3">Development Steps</h3>
        <ol className="space-y-2">
          {project.steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-white/60 [html.light_&]:text-ink-2/60">
              <span className="w-5 h-5 rounded-full bg-growth-500/12 text-growth-400 text-[10px] font-mono flex items-center justify-center shrink-0">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <h4 className="text-xs uppercase tracking-wide text-white/40 [html.light_&]:text-ink-2/40 mb-2">Skills You'll Learn</h4>
          <div className="flex flex-wrap gap-1.5">{project.skills_learned.map((s) => <Pill key={s}>{s}</Pill>)}</div>
        </Card>
        <Card>
          <h4 className="text-xs uppercase tracking-wide text-white/40 [html.light_&]:text-ink-2/40 mb-2">Expected Outcome</h4>
          <p className="text-sm text-white/60 [html.light_&]:text-ink-2/60">{project.outcome}</p>
        </Card>
      </div>

      <Card className="bg-growth-500/8 border-growth-500/20">
        <h4 className="text-xs uppercase tracking-wide text-growth-400 mb-2">Portfolio Value</h4>
        <p className="text-sm text-white/70 [html.light_&]:text-ink-2/70">{project.portfolio_value}</p>
      </Card>
    </div>
  );
}
