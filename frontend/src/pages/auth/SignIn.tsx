import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { GuideMark } from "../../components/GuideMark";
import { Button } from "../../components/ui";
import { api, ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

type Step = "email" | "otp" | "profile" | "welcome";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const { setToken, refresh } = useAuth();
  const { push } = useToast();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function requestCode() {
    setError(null);
    if (!EMAIL_RE.test(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const res = await api.post<{ devCode?: string; mode: string }>("/auth/request-code", { email });
      setDevCode(res.devCode || null);
      setStep("otp");
      setCooldown(30);
      if (res.mode === "dev") push("Dev mode: verification code shown on screen below.", "info");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(code: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{
        token: string; isNewUser: boolean; hasName: boolean; onboardingComplete: boolean;
      }>("/auth/verify-code", { email, code });
      setToken(res.token);
      if (!res.hasName) {
        setStep("profile");
      } else if (!res.onboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/app");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function submitProfile() {
    setError(null);
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!college.trim()) { setError("Please enter your college."); return; }
    setLoading(true);
    try {
      await api.patch("/profile/basic", { name, college });
      await refresh();
      setStep("welcome");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div aria-hidden className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-growth-500/8 blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <GuideMark size={40} />
          <h1 className="font-display font-semibold text-xl mt-3">Career Guide AI</h1>
          <p className="text-sm text-white/40 [html.light_&]:text-ink-2/40">Your roadmap from first year to career.</p>
        </div>

        <div className="card-surface glass rounded-2xl p-6 sm:p-8">
          {step === "email" && (
            <EmailStep email={email} setEmail={setEmail} onSubmit={requestCode} loading={loading} error={error} />
          )}
          {step === "otp" && (
            <OtpStep
              email={email}
              devCode={devCode}
              onVerify={verifyCode}
              onResend={requestCode}
              onChangeEmail={() => { setStep("email"); setError(null); }}
              loading={loading}
              error={error}
              cooldown={cooldown}
            />
          )}
          {step === "profile" && (
            <ProfileStep name={name} setName={setName} college={college} setCollege={setCollege} onSubmit={submitProfile} loading={loading} error={error} />
          )}
          {step === "welcome" && <WelcomeStep name={name} college={college} onContinue={() => navigate("/onboarding")} />}
        </div>
      </div>
    </div>
  );
}

function StepShell({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="w-11 h-11 rounded-xl bg-growth-500/12 text-growth-400 flex items-center justify-center mb-4">{icon}</div>
      <h2 className="font-display font-semibold text-lg mb-1">{title}</h2>
      <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="text-xs text-coral-400 mt-2" role="alert">{error}</p>;
}

function EmailStep({ email, setEmail, onSubmit, loading, error }: { email: string; setEmail: (v: string) => void; onSubmit: () => void; loading: boolean; error: string | null }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <StepShell icon={<Mail size={20} />} title="Enter your email to continue" subtitle="We'll send a 6-digit verification code — no password needed.">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@college.edu"
          className="w-full bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-4 py-3 text-sm outline-none focus:border-growth-500/50"
        />
        <FieldError error={error} />
        <Button type="submit" disabled={loading} className="w-full mt-5">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
        </Button>
      </StepShell>
    </form>
  );
}

function OtpStep({
  email, devCode, onVerify, onResend, onChangeEmail, loading, error, cooldown,
}: {
  email: string; devCode: string | null; onVerify: (code: string) => void; onResend: () => void;
  onChangeEmail: () => void; loading: boolean; error: string | null; cooldown: number;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onVerify(next.join(""));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      onVerify(text);
    }
  };

  return (
    <StepShell icon={<ShieldCheck size={20} />} title="Check your email" subtitle={`Enter the 6-digit verification code we sent to ${email}.`}>
      <div className="flex gap-2 justify-between" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            className="w-11 h-12 text-center text-lg font-mono bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl outline-none focus:border-growth-500/50"
          />
        ))}
      </div>
      <FieldError error={error} />

      {devCode && (
        <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/8 px-3 py-2.5">
          <p className="text-xs text-amber-400 font-medium">Dev mode — no email was sent</p>
          <p className="text-xs text-white/60 [html.light_&]:text-ink-2/60 mt-0.5">
            Your code is <span className="font-mono font-semibold">{devCode}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-5 text-xs">
        <button onClick={onChangeEmail} className="text-white/40 hover:text-white/70 [html.light_&]:text-ink-2/40">Change email</button>
        <button
          onClick={onResend}
          disabled={cooldown > 0}
          className="flex items-center gap-1 text-growth-400 hover:text-growth-300 disabled:text-white/25 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} /> {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
      {loading && <p className="text-xs text-white/40 mt-3 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Verifying…</p>}
    </StepShell>
  );
}

function ProfileStep({ name, setName, college, setCollege, onSubmit, loading, error }: {
  name: string; setName: (v: string) => void; college: string; setCollege: (v: string) => void;
  onSubmit: () => void; loading: boolean; error: string | null;
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <StepShell icon={<GuideMark size={20} />} title="Let's build your profile" subtitle="Just the essentials to get started.">
        <div className="space-y-3">
          <div>
            <label htmlFor="name" className="text-xs text-white/50 [html.light_&]:text-ink-2/50 mb-1 block">Your Name</label>
            <input id="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
              className="w-full bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-4 py-3 text-sm outline-none focus:border-growth-500/50" />
          </div>
          <div>
            <label htmlFor="college" className="text-xs text-white/50 [html.light_&]:text-ink-2/50 mb-1 block">Your College</label>
            <input id="college" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Enter your college/university"
              className="w-full bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-4 py-3 text-sm outline-none focus:border-growth-500/50" />
          </div>
        </div>
        <FieldError error={error} />
        <Button type="submit" disabled={loading} className="w-full mt-5">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
        </Button>
      </StepShell>
    </form>
  );
}

function WelcomeStep({ name, college, onContinue }: { name: string; college: string; onContinue: () => void }) {
  return (
    <div className="text-center py-2">
      <p className="text-2xl mb-2">👋</p>
      <h2 className="font-display font-semibold text-xl">Welcome, {name}!</h2>
      <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Let's build your engineering career roadmap.</p>
      <div className="card-surface rounded-xl px-4 py-3 mt-5 text-left">
        <p className="text-xs text-white/40 [html.light_&]:text-ink-2/40">College</p>
        <p className="text-sm font-medium mt-0.5">{college}</p>
      </div>
      <p className="text-sm text-white/60 [html.light_&]:text-ink-2/60 mt-5">Let's discover where you want to go.</p>
      <Button onClick={onContinue} className="w-full mt-4">
        Create My Career Roadmap <ArrowRight size={16} />
      </Button>
    </div>
  );
}
