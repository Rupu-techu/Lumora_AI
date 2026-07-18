"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Clock, Loader2 } from "lucide-react";
import { projectsApi, storiesApi } from "@/lib/api";

const genres = ["Fantasy", "Sci-Fi", "Mystery", "Romance", "Horror", "Drama", "Thriller", "Adventure"];
const lengths = [
  { label: "Short (500w)", value: "short" as const },
  { label: "Medium (1500w)", value: "medium" as const },
  { label: "Long (3000w)", value: "long" as const },
  { label: "Epic (5000w+)", value: "epic" as const },
];
const tones = ["Dark", "Hopeful", "Humorous", "Tense", "Lyrical"];
const povs = ["First person", "Third limited", "Third omniscient"];

type BackendProject = {
  id: string;
  title: string;
};

type BackendStory = {
  id: string;
  title: string;
  genre?: string | null;
  word_count: number;
  updated_at: string;
};

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function StoryGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [length, setLength] = useState<(typeof lengths)[number]["value"]>("medium");
  const [tone, setTone] = useState("Dark");
  const [pov, setPov] = useState("Third limited");
  const [project, setProject] = useState<BackendProject | null>(null);
  const [recentStories, setRecentStories] = useState<BackendStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      setInitialLoading(true);
      setError("");
      try {
        const projectsResponse = await projectsApi.list({ limit: 1 });
        const firstProject = (projectsResponse.data.items as BackendProject[])[0] || null;
        if (!mounted) return;
        setProject(firstProject);

        if (firstProject) {
          const storiesResponse = await storiesApi.list(firstProject.id, { limit: 10 });
          if (!mounted) return;
          setRecentStories(storiesResponse.data.items as BackendStory[]);
        } else {
          setRecentStories([]);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.detail || "Failed to load projects and stories.");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    }

    void loadInitialData();
    return () => {
      mounted = false;
    };
  }, []);

  const projectLabel = useMemo(() => project?.title || "No project selected", [project]);

  async function generate() {
    if (!prompt.trim() || loading || !project) return;
    setLoading(true);
    setOutput(null);
    setError("");
    try {
      const response = await storiesApi.generate({
        project_id: project.id,
        prompt: prompt.trim(),
        genre,
        tone,
        pov,
        length,
        save: true,
      });
      setOutput(response.data.generated_text);
      if (response.data.story) {
        const saved = response.data.story;
        setRecentStories((prev) => [
          {
            id: saved.id,
            title: saved.title,
            genre: saved.genre,
            word_count: saved.word_count,
            updated_at: saved.updated_at,
          },
          ...prev.filter((story) => story.id !== saved.id),
        ]);
      } else {
        const storiesResponse = await storiesApi.list(project.id, { limit: 10 });
        setRecentStories(storiesResponse.data.items as BackendStory[]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Story generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-purple-300">
          <BookOpen className="w-3.5 h-3.5" /> Story Generator
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Generate your story</h1>
        <p className="text-slate-400">
          Describe a concept and let IBM Granite craft a complete narrative arc. {projectLabel !== "No project selected" ? `Using ${projectLabel}.` : ""}
        </p>
      </motion.div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-sm text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55 }}
        className="glass-card rounded-3xl p-6 space-y-5"
      >
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">Story prompt</label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A disgraced knight discovers an ancient map that leads to a weapon capable of ending a centuries-long war..."
            className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Genre</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {genres.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Length</label>
            <select value={length} onChange={(e) => setLength(e.target.value as (typeof lengths)[number]["value"])} className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {lengths.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {tones.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">POV</label>
            <select value={pov} onChange={(e) => setPov(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {povs.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={generate}
          disabled={loading || initialLoading || !prompt.trim() || !project}
          className="btn-primary w-full justify-center py-3.5 rounded-2xl text-sm disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate story with IBM Granite"}
        </motion.button>
      </motion.div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent stories</h2>
        <div className="space-y-3">
          {initialLoading ? (
            <div className="glass-card rounded-2xl p-6 text-slate-400 text-sm">Loading recent stories from the backend...</div>
          ) : recentStories.length > 0 ? (
            recentStories.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{s.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-purple-400">{s.genre || "General"}</span>
                    <span className="text-xs text-slate-500">{s.word_count.toLocaleString()} words</span>
                    <span className="flex items-center gap-1 text-xs text-slate-600"><Clock className="w-3 h-3" />{formatRelativeDate(s.updated_at)}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
              </motion.div>
            ))
          ) : (
            <div className="glass-card rounded-2xl p-6 text-slate-400 text-sm">
              No stories have been generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
