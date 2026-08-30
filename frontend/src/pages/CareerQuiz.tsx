import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Card, Button, Pill } from "../components/ui";
import { api } from "../lib/api";

interface QuizAnswers {
  enjoysCoding: boolean;
  enjoysMath: boolean;
  enjoysNetworking: boolean;
  enjoysBuilding: boolean;
  enjoysResearch: boolean;
  enjoysBusiness: boolean;
  teamPreference: "team" | "individual" | "either";
}

interface QuizResult {
  careerId: string;
  name: string;
  description: string;
  matchPercent: number;
}

type BooleanQuizKey = Exclude<keyof QuizAnswers, "teamPreference">;

const QUESTIONS: { key: BooleanQuizKey; label: string }[] = [
  { key: "enjoysCoding", label: "Do you enjoy coding and solving logic puzzles?" },
  { key: "enjoysMath", label: "Do you enjoy mathematics and quantitative thinking?" },
  { key: "enjoysNetworking", label: "Are you curious about how networks and systems connect?" },
  { key: "enjoysBuilding", label: "Do you like building and shipping tangible things?" },
  { key: "enjoysResearch", label: "Do you enjoy deep research and reading into a topic?" },
  { key: "enjoysBusiness", label: "Are you drawn to business, communication or explaining ideas?" },
];

export default function CareerQuiz() {
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== undefined) && answers.teamPreference !== undefined;

  async function submit() {
    setLoading(true);
    try {
      const data = await api.post<{ results: QuizResult[] }>("/quiz/career-discovery", answers);
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  }

  if (results) {
    return (
      <div className="space-y-6">
        <Link to="/app/careers" className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 [html.light_&]:text-ink-2/50"><ArrowLeft size={14} /> Career Explorer</Link>
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-growth-400" />
          <h1 className="font-display font-bold text-2xl">Recommended Career Paths</h1>
        </div>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50">
          This is guidance based on your answers, not a scientific determination of your best career. Explore a few before committing.
        </p>
        <div className="space-y-3">
          {results.map((r, i) => (
            <Link key={r.careerId} to={`/app/careers/${r.careerId}`}>
              <Card className="hover:border-growth-500/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-semibold">{i + 1}. {r.name}</h3>
                  <Pill tone="growth">{r.matchPercent}% match</Pill>
                </div>
                <p className="text-sm text-white/55 [html.light_&]:text-ink-2/55">{r.description}</p>
              </Card>
            </Link>
          ))}
        </div>
        <Button variant="secondary" onClick={() => { setResults(null); setAnswers({}); }}>Retake the quiz</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/app/careers" className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 [html.light_&]:text-ink-2/50"><ArrowLeft size={14} /> Career Explorer</Link>
      <div>
        <h1 className="font-display font-bold text-2xl">I don't know what career I want</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Answer honestly — there's no wrong answer, this is just a starting point.</p>
      </div>

      <Card className="space-y-5">
        {QUESTIONS.map((q) => (
          <div key={q.key}>
            <p className="text-sm mb-2">{q.label}</p>
            <div className="flex gap-2">
              <YesNo value={answers[q.key]} onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))} />
            </div>
          </div>
        ))}
        <div>
          <p className="text-sm mb-2">Do you prefer individual or team work?</p>
          <div className="flex gap-2 flex-wrap">
            {(["individual", "team", "either"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setAnswers((a) => ({ ...a, teamPreference: v }))}
                className={`px-3.5 py-2 rounded-xl border text-sm capitalize ${
                  answers.teamPreference === v ? "border-growth-500/60 bg-growth-500/10 text-growth-400" : "border-ink-border [html.light_&]:border-paper-border"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Button onClick={submit} disabled={!allAnswered || loading} className="w-full sm:w-auto">
        See My Matches <ArrowRight size={16} />
      </Button>
    </div>
  );
}

function YesNo({ value, onChange }: { value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <>
      <button onClick={() => onChange(true)} className={`px-4 py-2 rounded-xl border text-sm ${value === true ? "border-growth-500/60 bg-growth-500/10 text-growth-400" : "border-ink-border [html.light_&]:border-paper-border"}`}>Yes</button>
      <button onClick={() => onChange(false)} className={`px-4 py-2 rounded-xl border text-sm ${value === false ? "border-coral-500/60 bg-coral-500/10 text-coral-400" : "border-ink-border [html.light_&]:border-paper-border"}`}>No</button>
    </>
  );
}
