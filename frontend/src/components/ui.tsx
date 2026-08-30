import type { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card-surface rounded-2xl p-5 ${className}`}>{children}</div>;
}

export function ProgressBar({ value, tone = "growth" }: { value: number; tone?: "growth" | "amber" | "sky" }) {
  const barColor = { growth: "bg-growth-500", amber: "bg-amber-400", sky: "bg-sky-500" }[tone];
  return (
    <div className="h-2 w-full rounded-full bg-white/10 [html.light_&]:bg-ink/10 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${barColor} transition-[width] duration-500 ease-out`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-white/50 [html.light_&]:text-ink-2/50">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center card-surface rounded-2xl">
      <Inbox className="text-white/30" size={32} />
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm text-white/50 [html.light_&]:text-ink-2/60 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 [html.light_&]:bg-ink/5 ${className}`} />;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "growth" | "amber" | "sky" | "coral" }) {
  const tones: Record<string, string> = {
    neutral: "bg-white/8 text-white/70 [html.light_&]:bg-ink/8 [html.light_&]:text-ink-2/70",
    growth: "bg-growth-500/15 text-growth-400",
    amber: "bg-amber-400/15 text-amber-400",
    sky: "bg-sky-500/15 text-sky-400",
    coral: "bg-coral-500/15 text-coral-400",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
  size = "md",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-growth-500 text-ink hover:bg-growth-400 hover:shadow-glow",
    secondary: "card-surface hover:border-growth-500/40",
    ghost: "text-white/70 hover:text-white [html.light_&]:text-ink-2/70 [html.light_&]:hover:text-ink-2 hover:bg-white/5",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
