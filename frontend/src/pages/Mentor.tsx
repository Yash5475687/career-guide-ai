import { useEffect, useRef, useState } from "react";
import { Bot, Send, Loader2, User as UserIcon } from "lucide-react";
import { Card } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Message { id: number; role: "user" | "assistant"; message: string; created_at?: string; }

const SUGGESTIONS = [
  "What should I learn after Python?",
  "Should I learn Java or Python?",
  "I have 2 hours every day. Create a study plan.",
  "How can I get an internship?",
  "Am I ready to start DSA?",
];

export default function Mentor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get<{ history: Message[] }>("/mentor/history").then((d) => setMessages(d.history)).finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || sending) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", message: question }]);
    setSending(true);
    try {
      const res = await api.post<{ answer: string }>("/mentor/ask", { question });
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", message: res.answer }]);
    } catch {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", message: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2"><Bot className="text-growth-400" size={24} /> AI Career Mentor</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Answers grounded in your actual roadmap and profile.</p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 !p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {!loadingHistory && messages.length === 0 && (
            <div className="text-center py-8">
              <Bot size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40 [html.light_&]:text-ink-2/40 mb-4">Ask me anything about your learning path, {user?.name?.split(" ")[0] || "there"}.</p>
              <div className="flex flex-col items-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs px-3 py-2 rounded-full border border-ink-border [html.light_&]:border-paper-border hover:border-growth-500/40 text-white/60 [html.light_&]:text-ink-2/60">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-growth-500/12 text-growth-400 flex items-center justify-center shrink-0"><Bot size={14} /></div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-growth-500 text-ink" : "bg-white/5 [html.light_&]:bg-ink/5"
              }`}>
                {m.message}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0"><UserIcon size={14} /></div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-growth-500/12 text-growth-400 flex items-center justify-center shrink-0"><Bot size={14} /></div>
              <div className="rounded-2xl px-4 py-2.5 bg-white/5 [html.light_&]:bg-ink/5"><Loader2 size={14} className="animate-spin" /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-ink-border [html.light_&]:border-paper-border p-3 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your mentor…"
            className="flex-1 bg-white/5 [html.light_&]:bg-ink/5 border border-ink-border [html.light_&]:border-paper-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-growth-500/50"
          />
          <button type="submit" disabled={sending || !input.trim()} aria-label="Send message" className="w-10 h-10 shrink-0 rounded-xl bg-growth-500 text-ink flex items-center justify-center disabled:opacity-40">
            <Send size={16} />
          </button>
        </form>
      </Card>
    </div>
  );
}
