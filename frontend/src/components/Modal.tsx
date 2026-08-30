import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative card-surface glass rounded-2xl w-full max-w-md p-6 shadow-2xl animate-[fadeIn_0.15s_ease]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="font-display font-semibold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="text-white/40 hover:text-white/80 [html.light_&]:text-ink-2/40 [html.light_&]:hover:text-ink-2">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
