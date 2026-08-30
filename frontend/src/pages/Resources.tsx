import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, LoadingState, Pill, EmptyState } from "../components/ui";
import { api } from "../lib/api";
import type { Resource } from "../lib/types";

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ topics: string[] }>("/resources/topics").then((d) => setTopics(d.topics));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (topicFilter) params.set("topic", topicFilter);
    if (freeOnly) params.set("free", "true");
    api.get<{ resources: Resource[] }>(`/resources?${params.toString()}`).then((d) => setResources(d.resources)).finally(() => setLoading(false));
  }, [topicFilter, freeOnly]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Resource Hub</h1>
        <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50 mt-1">Curated learning resources from reputable platforms.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setTopicFilter("")} className={`px-3 py-1.5 rounded-full text-xs border ${!topicFilter ? "border-growth-500/60 bg-growth-500/10 text-growth-400" : "border-ink-border [html.light_&]:border-paper-border"}`}>All</button>
        {topics.map((t) => (
          <button key={t} onClick={() => setTopicFilter(t)} className={`px-3 py-1.5 rounded-full text-xs border ${topicFilter === t ? "border-growth-500/60 bg-growth-500/10 text-growth-400" : "border-ink-border [html.light_&]:border-paper-border"}`}>{t}</button>
        ))}
        <label className="flex items-center gap-1.5 text-xs text-white/50 [html.light_&]:text-ink-2/50 ml-2">
          <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="accent-growth-500" /> Free only
        </label>
      </div>

      {loading ? <LoadingState /> : resources.length === 0 ? (
        <EmptyState title="No resources found" description="Try a different topic filter." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {resources.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display font-semibold text-sm">{r.title}</h3>
                {r.free ? <Pill tone="growth">Free</Pill> : <Pill tone="amber">Paid</Pill>}
              </div>
              <p className="text-xs text-white/40 [html.light_&]:text-ink-2/40 mb-2">{r.platform} · {r.topic} · {r.difficulty} · {r.duration}</p>
              <p className="text-sm text-white/60 [html.light_&]:text-ink-2/60 mb-2">{r.description}</p>
              <p className="text-xs text-white/40 [html.light_&]:text-ink-2/40 mb-3 italic">Why: {r.why}</p>
              <a href={r.link} target="_blank" rel="noreferrer" className="text-xs text-growth-400 flex items-center gap-1 mt-auto">
                Visit resource <ExternalLink size={12} />
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
