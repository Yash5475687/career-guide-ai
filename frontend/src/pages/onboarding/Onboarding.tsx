import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "../../components/ui";
import { GuideMark } from "../../components/GuideMark";
import { api, ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const BRANCHES = ["CSE", "Cybersecurity", "AI & ML", "Data Science", "ECE", "EEE", "Mechanical", "Civil", "IT", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const EXPERIENCE = ["Complete Beginner", "Beginner", "Intermediate", "Advanced"];
const INTERESTS = [
  "Web Development", "App Development", "AI/ML", "Cybersecurity", "Data Science", "Cloud Computing",
  "DevOps", "Blockchain", "Software Development", "Game Development", "UI/UX", "Networking",
  "Embedded Systems", "Robotics", "Entrepreneurship", "Competitive Programming",
];
const GOALS = [
  "Software Developer", "Cybersecurity Engineer", "AI Engineer", "Data Scientist", "Cloud Engineer",
  "DevOps Engineer", "Full Stack Developer", "Mobile Developer", "Researcher", "Entrepreneur",
  "Government/Defence Tech Career", "Not Sure Yet",
];
const TIME_OPTIONS = ["30 minutes/day", "1 hour/day", "2 hours/day", "3+ hours/day"];

const TOTAL_STEPS = 6;

export default function Onboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [experience, setExperience] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { refresh } = useAuth();

  const toggleInterest = (i: string) => setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const canProceed = [
    Boolean(branch), Boolean(year), Boolean(experience), interests.length > 0, Boolean(careerGoal), Boolean(dailyTime),
  ][stepIndex];

  async function finish() {
    setError(null);
    setLoading(true);
    try {
      await api.patch("/profile/onboarding", { branch, year, experience, interests, career_goal: careerGoal, daily_time: dailyTime });
      await refresh();
      navigate("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your roadmap. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (stepIndex === TOTAL_STEPS - 1) { finish(); return; }
    setStepIndex((s) => s + 1);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <GuideMark size={34} />
          <p className="text-xs text-white/40 [html.light_&]:text-ink-2/40 mt-2">Step {stepIndex + 1} of {TOTAL_STEPS}</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 [html.light_&]:bg-ink/10 mb-8 overflow-hidden">
          <div className="h-full rounded-full bg-growth-500 transition-all duration-300" style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }} />
        </div>

        <div className="card-surface glass rounded-2xl p-6 sm:p-8">
          {stepIndex === 0 && (
            <ChoiceStep title="What are you studying?" options={BRANCHES} selected={branch ? [branch] : []} onSelect={(v) => setBranch(v)} />
          )}
          {stepIndex === 1 && (
            <ChoiceStep title="What year are you in?" options={YEARS} selected={year ? [year] : []} onSelect={(v) => setYear(v)} />
          )}
          {stepIndex === 2 && (
            <ChoiceStep title="What is your current experience?" options={EXPERIENCE} selected={experience ? [experience] : []} onSelect={(v) => setExperience(v)} />
          )}
          {stepIndex === 3 && (
            <ChoiceStep title="What interests you?" subtitle="Select all that apply." options={INTERESTS} selected={interests} onSelect={toggleInterest} multi />
          )}
          {stepIndex === 4 && (
            <ChoiceStep title="What is your career goal?" options={GOALS} selected={careerGoal ? [careerGoal] : []} onSelect={(v) => setCareerGoal(v)} />
          )}
          {stepIndex === 5 && (
            <ChoiceStep title="How much time can you spend learning?" options={TIME_OPTIONS} selected={dailyTime ? [dailyTime] : []} onSelect={(v) => setDailyTime(v)} />
          )}

          {error && <p className="text-xs text-coral-400 mt-4" role="alert">{error}</p>}

          <div className="flex items-center justify-between mt-7">
            <button
              onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
              disabled={stepIndex === 0}
              className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 disabled:opacity-30 [html.light_&]:text-ink-2/50"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <Button onClick={next} disabled={!canProceed || loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : stepIndex === TOTAL_STEPS - 1 ? "Create My Roadmap" : "Next"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoiceStep({
  title, subtitle, options, selected, onSelect, multi = false,
}: {
  title: string; subtitle?: string; options: string[]; selected: string[]; onSelect: (v: string) => void; multi?: boolean;
}) {
  return (
    <div>
      <h2 className="font-display font-semibold text-lg mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mb-4">{subtitle}</p>}
      <div className={`grid ${multi ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"} gap-2 ${!subtitle ? "mt-4" : ""}`}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`flex items-center justify-between gap-2 text-left px-3.5 py-3 rounded-xl border text-sm transition-colors ${
                isSelected
                  ? "border-growth-500/60 bg-growth-500/10 text-growth-400"
                  : "border-ink-border [html.light_&]:border-paper-border hover:border-white/20 [html.light_&]:hover:border-ink/20"
              }`}
            >
              <span>{opt}</span>
              {isSelected && <Check size={15} className="shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
