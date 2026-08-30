import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, ShieldCheck, Rocket, Sparkles } from "lucide-react";
import { Card, ProgressBar, LoadingState, Pill, Button } from "../components/ui";
import { api } from "../lib/api";
import type { DashboardData } from "../lib/types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>("/dashboard").then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (!data) return null;

  const greeting = getGreeting();
  const firstName = data.user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">{greeting}, {firstName}</h1>
        {data.primaryCareer && (
          <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">
            Your career goal: <span className="text-growth-400 font-medium">{data.primaryCareer.name}</span>
          </p>
        )}
      </div>

      {/* YOUR NEXT STEP — the signature mentor-feel component */}
      {data.nextStep && (
        <Card className="!p-6 bg-gradient-to-br from-growth-500/10 via-transparent to-sky-500/5 border-growth-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-growth-400" />
            <p className="text-xs tracking-wide uppercase text-growth-400 font-semibold">Your Next Step</p>
          </div>
          <h2 className="font-display font-semibold text-xl mb-2">{data.nextStep.title}</h2>
          <p className="text-sm text-white/60 [html.light_&]:text-ink-2/60 mb-4">{data.nextStep.why}</p>
          <ProgressBar value={data.nextStep.progress} />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-white/40 [html.light_&]:text-ink-2/40">{data.nextStep.progress}% complete</span>
            <Link to="/app/skills">
              <Button size="sm">Continue Learning <ArrowRight size={14} /></Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Overall Progress" value={`${data.overallProgress}%`} icon={<Rocket size={16} />} />
        <StatCard label="Learning Streak" value={`${data.streak} day${data.streak === 1 ? "" : "s"}`} icon={<Flame size={16} />} />
        <StatCard label="Internship Readiness" value={`${data.readinessScore}%`} icon={<ShieldCheck size={16} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold text-sm mb-3">Your Skills</h3>
          {data.skills.length === 0 ? (
            <p className="text-sm text-white/40 [html.light_&]:text-ink-2/40">No skills tracked yet — complete onboarding to get starter skills.</p>
          ) : (
            <div className="space-y-3">
              {data.skills.slice(0, 5).map((s) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{s.name}</span>
                    <Pill tone={s.status === "completed" ? "growth" : "neutral"}>{s.status.replace("_", " ")}</Pill>
                  </div>
                  <ProgressBar value={s.progress} />
                </div>
              ))}
              <Link to="/app/skills" className="text-xs text-growth-400 flex items-center gap-1 mt-2">
                View all skills <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-sm mb-3">Upcoming Goals</h3>
          {data.upcomingGoals.length === 0 ? (
            <p className="text-sm text-white/40 [html.light_&]:text-ink-2/40">Your roadmap will populate this once you've set a career goal.</p>
          ) : (
            <ul className="space-y-2.5">
              {data.upcomingGoals.map((g, i) => (
                <li key={g} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-growth-500/12 text-growth-400 text-[10px] font-mono flex items-center justify-center shrink-0">{i + 1}</span>
                  {g}
                </li>
              ))}
            </ul>
          )}
          <Link to="/app/roadmap" className="text-xs text-growth-400 flex items-center gap-1 mt-3">
            View full roadmap <ArrowRight size={12} />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-2 text-white/40 [html.light_&]:text-ink-2/40 mb-2">{icon}<span className="text-xs">{label}</span></div>
      <p className="font-display font-semibold text-2xl">{value}</p>
    </Card>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
