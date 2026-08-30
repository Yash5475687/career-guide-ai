import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card, Button, Pill } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const BRANCHES = ["CSE", "Cybersecurity", "AI & ML", "Data Science", "ECE", "EEE", "Mechanical", "Civil", "IT", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const GOALS = [
  "Software Developer", "Cybersecurity Engineer", "AI Engineer", "Data Scientist", "Cloud Engineer",
  "DevOps Engineer", "Full Stack Developer", "Mobile Developer", "Researcher", "Entrepreneur",
  "Government/Defence Tech Career", "Not Sure Yet",
];
const INTERESTS = [
  "Web Development", "App Development", "AI/ML", "Cybersecurity", "Data Science", "Cloud Computing",
  "DevOps", "Blockchain", "Software Development", "Game Development", "UI/UX", "Networking",
  "Embedded Systems", "Robotics", "Entrepreneurship", "Competitive Programming",
];

export default function Profile() {
  const { user, profile, refresh } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name || ""); setCollege(user.college || ""); }
    if (profile) { setBranch(profile.branch || ""); setYear(profile.year || ""); setCareerGoal(profile.career_goal || ""); setInterests(profile.interests || []); }
  }, [user, profile]);

  const toggleInterest = (i: string) => setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  async function save() {
    setSaving(true);
    try {
      await api.patch("/profile", { name, college, branch, year, career_goal: careerGoal, interests });
      await refresh();
      push("Profile updated.", "success");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't save changes.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl">Profile</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Verified email: <span className="font-mono">{user?.email}</span></p>
      </div>

      <Card className="space-y-4">
        <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="input-field" /></Field>
        <Field label="College"><input value={college} onChange={(e) => setCollege(e.target.value)} className="input-field" /></Field>
        <Field label="Branch">
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="input-field">
            <option value="">Select branch</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Year">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="input-field">
            <option value="">Select year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Career Goal">
          <select value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} className="input-field">
            <option value="">Select goal</option>
            {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <div>
          <p className="text-xs text-white/50 [html.light_&]:text-ink-2/50 mb-2">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {INTERESTS.map((i) => {
              const selected = interests.includes(i);
              return (
                <button key={i} onClick={() => toggleInterest(i)} className={selected ? "" : ""}>
                  <Pill tone={selected ? "growth" : "neutral"}>
                    {selected && <Check size={11} className="inline mr-1" />}{i}
                  </Pill>
                </button>
              );
            })}
          </div>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
        </Button>
      </Card>

      <style>{`.input-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid #232C42; border-radius: 0.75rem; padding: 0.625rem 1rem; font-size: 0.875rem; outline: none; }
      html.light .input-field { background: rgba(10,14,23,0.05); border-color: #E4E0D6; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/50 [html.light_&]:text-ink-2/50 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
