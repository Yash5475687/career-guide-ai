import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Compass, ListChecks, BookOpen, Rocket } from "lucide-react";
import { api } from "../lib/api";

interface SearchResults {
  careers: { id: string; name: string; description: string }[];
  skills: { id: string; name: string; category: string }[];
  resources: { id: string; title: string; platform: string; topic: string; link: string }[];
  projects: { id: string; name: string; difficulty: string }[];
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) { setQuery(""); setResults(null); }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    const handle = setTimeout(async () => {
      try {
        const data = await api.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch {
        setResults(null);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  if (!open) return null;

  const go = (path: string) => { onClose(); navigate(path); };
  const hasResults = results && (results.careers.length || results.skills.length || results.resources.length || results.projects.length);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-surface glass rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-border [html.light_&]:border-paper-border">
          <Search size={18} className="text-white/40 [html.light_&]:text-ink-2/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search careers, skills, resources, projects…"
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-white/30 [html.light_&]:placeholder:text-ink-2/30"
          />
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {!query.trim() && <p className="px-4 py-6 text-sm text-white/40 [html.light_&]:text-ink-2/40 text-center">Start typing to search everything in Career Guide AI.</p>}
          {query.trim() && !hasResults && <p className="px-4 py-6 text-sm text-white/40 [html.light_&]:text-ink-2/40 text-center">No matches for "{query}".</p>}
          {results?.careers.map((c) => (
            <button key={c.id} onClick={() => go(`/app/careers/${c.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left">
              <Compass size={16} className="text-growth-400 shrink-0" />
              <div className="min-w-0"><p className="text-sm font-medium truncate">{c.name}</p><p className="text-xs text-white/40 [html.light_&]:text-ink-2/40">Career</p></div>
            </button>
          ))}
          {results?.skills.map((s) => (
            <button key={s.id} onClick={() => go(`/app/skills`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left">
              <ListChecks size={16} className="text-sky-400 shrink-0" />
              <div className="min-w-0"><p className="text-sm font-medium truncate">{s.name}</p><p className="text-xs text-white/40 [html.light_&]:text-ink-2/40">{s.category}</p></div>
            </button>
          ))}
          {results?.resources.map((r) => (
            <button key={r.id} onClick={() => go(`/app/resources`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left">
              <BookOpen size={16} className="text-amber-400 shrink-0" />
              <div className="min-w-0"><p className="text-sm font-medium truncate">{r.title}</p><p className="text-xs text-white/40 [html.light_&]:text-ink-2/40">{r.platform} · {r.topic}</p></div>
            </button>
          ))}
          {results?.projects.map((p) => (
            <button key={p.id} onClick={() => go(`/app/projects/${p.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left">
              <Rocket size={16} className="text-coral-400 shrink-0" />
              <div className="min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-white/40 [html.light_&]:text-ink-2/40">{p.difficulty}</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
