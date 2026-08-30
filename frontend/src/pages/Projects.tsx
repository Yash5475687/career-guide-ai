import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, LoadingState, Pill } from "../components/ui";
import { api } from "../lib/api";
import type { ProjectItem } from "../lib/types";

export default function Projects() {
  const [recommended, setRecommended] = useState<ProjectItem[]>([]);
  const [all, setAll] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ projects: ProjectItem[] }>("/projects/recommended"),
      api.get<{ projects: ProjectItem[] }>("/projects"),
    ]).then(([rec, everything]) => {
      setRecommended(rec.projects);
      setAll(everything.projects);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Finding projects for you…" />;

  const recommendedIds = new Set(recommended.map((p) => p.id));
  const rest = all.filter((p) => !recommendedIds.has(p.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl">Build Your Next Project</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Matched to your career goal and experience level.</p>
      </div>

      {recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-growth-400" />
            <h2 className="font-display font-semibold text-sm">Recommended For You</h2>
          </div>
          <ProjectGrid projects={recommended} />
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold text-sm text-white/60 [html.light_&]:text-ink-2/60 mb-3">All Projects</h2>
        <ProjectGrid projects={rest} />
      </div>
    </div>
  );
}

function ProjectGrid({ projects }: { projects: ProjectItem[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <Link key={p.id} to={`/app/projects/${p.id}`}>
          <Card className="h-full hover:border-growth-500/40 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-semibold text-sm">{p.name}</h3>
              <Pill tone="amber">{p.difficulty}</Pill>
            </div>
            <p className="text-xs text-white/55 [html.light_&]:text-ink-2/55 mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">{p.technologies.slice(0, 3).map((t) => <Pill key={t}>{t}</Pill>)}</div>
            <span className="text-xs text-growth-400 flex items-center gap-1">View project <ArrowRight size={12} /></span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
