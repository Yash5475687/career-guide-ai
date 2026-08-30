import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Compass, GitBranch, Rocket, ListChecks, Bot, ShieldCheck,
  HelpCircle, Layers, Target, GraduationCap,
} from "lucide-react";
import { GuideMark } from "../components/GuideMark";
import { Button, Card } from "../components/ui";

const PROBLEMS = [
  "Don't know which language to learn",
  "Too many courses, too many technologies",
  "Don't know what projects to build",
  "Don't know what companies expect",
  "Don't know when to start internships",
  "Don't know how to prepare for placements",
];

const STEPS = [
  { icon: GraduationCap, title: "Tell us about yourself", desc: "Branch, year, and where you're starting from." },
  { icon: Compass, title: "Choose your interests", desc: "Web, AI/ML, security, cloud — pick what excites you." },
  { icon: Target, title: "Discover a career path", desc: "See paths that fit, with a plain-English 'why'." },
  { icon: GitBranch, title: "Get your roadmap", desc: "A year-by-year plan built around your goal." },
  { icon: Layers, title: "Learn the required skills", desc: "Curated, ranked resources for each skill." },
  { icon: Rocket, title: "Build projects", desc: "Portfolio-worthy projects matched to your level." },
  { icon: ListChecks, title: "Track your progress", desc: "See exactly what's next, always." },
  { icon: ShieldCheck, title: "Prepare for internships & jobs", desc: "A readiness score and a concrete checklist." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <GuideMark size={30} />
          <span className="font-display font-semibold tracking-tight">Career Guide AI</span>
        </div>
        <Button onClick={() => navigate("/signin")} size="sm">
          Sign In <ArrowRight size={15} />
        </Button>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center relative">
        <div aria-hidden className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-growth-500/10 blur-3xl pointer-events-none" />
        <p className="text-xs tracking-[0.2em] uppercase text-growth-400 font-medium mb-5">Built by Saksham</p>
        <h1 className="font-display font-bold text-4xl sm:text-6xl leading-[1.05] tracking-tight">
          Stop guessing what to learn.
          <br />
          <span className="bg-gradient-to-r from-growth-400 via-sky-400 to-amber-400 bg-clip-text text-transparent">
            Start building your career.
          </span>
        </h1>
        <p className="mt-6 text-lg text-white/60 [html.light_&]:text-ink-2/60 max-w-2xl mx-auto">
          Your personalized roadmap for engineering, skills, projects, internships and career growth —
          from first year to placement.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => navigate("/signin")} className="w-full sm:w-auto">
            Build My Roadmap <ArrowRight size={16} />
          </Button>
          <Button onClick={() => navigate("/signin")} variant="secondary" className="w-full sm:w-auto">
            Explore Careers
          </Button>
        </div>

        {/* Animated roadmap illustration */}
        <div className="mt-16 relative mx-auto max-w-3xl">
          <RoadmapHero />
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display font-semibold text-2xl sm:text-3xl">
            Engineering gives you a degree.
            <br className="hidden sm:block" /> Career Guide AI helps you build the career.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROBLEMS.map((p) => (
            <Card key={p} className="flex items-start gap-3 py-4">
              <HelpCircle size={18} className="text-coral-400 shrink-0 mt-0.5" />
              <p className="text-sm text-white/75 [html.light_&]:text-ink-2/75">{p}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display font-semibold text-2xl sm:text-3xl text-center mb-12">How Career Guide AI Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <Card className="h-full">
                <div className="w-9 h-9 rounded-lg bg-growth-500/12 text-growth-400 flex items-center justify-center mb-3">
                  <s.icon size={18} />
                </div>
                <p className="text-xs text-white/30 [html.light_&]:text-ink-2/30 font-mono mb-1">STEP {i + 1}</p>
                <h3 className="font-display font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-white/50 [html.light_&]:text-ink-2/50">{s.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* AI Mentor teaser */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <Card className="flex flex-col sm:flex-row items-center gap-6 !p-8 bg-gradient-to-br from-growth-500/10 to-sky-500/10">
          <div className="w-14 h-14 rounded-2xl bg-ink-2 [html.light_&]:bg-white flex items-center justify-center shrink-0">
            <Bot size={26} className="text-growth-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">An AI mentor that supports the plan — not one that replaces it</h3>
            <p className="text-sm text-white/60 [html.light_&]:text-ink-2/60 mt-1">
              Ask "What should I learn after Python?" or "I have 2 hours a day — build me a study plan." Career Guide
              AI answers based on your actual profile and roadmap, not a generic chat window.
            </p>
          </div>
        </Card>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-xs text-white/30 [html.light_&]:text-ink-2/30">
        Career Guide AI — Built by Saksham
      </footer>
    </div>
  );
}

function RoadmapHero() {
  const nodes = [
    { x: 40, y: 170, label: "Year 1" },
    { x: 140, y: 90, label: "Year 2" },
    { x: 260, y: 150, label: "Year 3" },
    { x: 380, y: 60, label: "Career" },
  ];
  return (
    <svg viewBox="0 0 420 210" className="w-full h-auto" aria-hidden="true">
      <path
        d="M40 170 C 90 170, 90 90, 140 90 S 210 150, 260 150 S 330 60, 380 60"
        fill="none"
        stroke="url(#hero-trail)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1000"
        strokeDashoffset="0"
        className="animate-[drawPath_2.5s_ease-out]"
      />
      <defs>
        <linearGradient id="hero-trail" x1="0" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C983" />
          <stop offset="0.5" stopColor="#4C7EE0" />
          <stop offset="1" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      {nodes.map((n, i) => (
        <g key={n.label} style={{ animation: `fadeIn 0.4s ease ${0.4 + i * 0.3}s both` }}>
          <circle cx={n.x} cy={n.y} r={9} fill="#0A0E17" stroke="#22C983" strokeWidth="2.5" />
          <circle cx={n.x} cy={n.y} r={3} fill="#22C983" />
          <text x={n.x} y={n.y - 18} textAnchor="middle" className="fill-white/70 [html.light_&]:fill-ink-2/70" fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight={600}>
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
