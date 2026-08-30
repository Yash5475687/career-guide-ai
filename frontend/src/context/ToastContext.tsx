import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
}

const ToastContext = createContext<{ push: (message: string, variant?: Toast["variant"]) => void } | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: Toast["variant"] = "info") => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
  const colors = {
    success: "border-growth-500/40 text-growth-400",
    error: "border-coral-500/40 text-coral-400",
    info: "border-sky-500/40 text-sky-400",
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={`card-surface glass rounded-xl border px-4 py-3 shadow-lg flex items-start gap-3 animate-[fadeIn_0.2s_ease] ${colors[t.variant]}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm toast-text flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-white/40 hover:text-white/80">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
