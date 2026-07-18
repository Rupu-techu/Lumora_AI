"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Film, Plus, GripVertical, Sparkles, Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { projectsApi, storiesApi } from "@/lib/api";

type BackendProject = {
  id: string;
  title: string;
  description?: string | null;
};

type BackendStory = {
  id: string;
  project_id: string;
  title: string;
  content: string;
  act?: string | null;
  status: "draft" | "written" | "approved" | "archived";
  updated_at: string;
};

type Scene = {
  id: string;
  project_id: string;
  title: string;
  desc: string;
  act: string;
  status: "draft" | "written" | "approved";
};

const STATUS_STYLE: Record<Scene["status"], { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-white/5", text: "text-slate-400", dot: "bg-slate-500" },
  written: { bg: "bg-blue-500/10", text: "text-blue-300", dot: "bg-blue-400" },
  approved: { bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
};

function mapStoryToScene(story: BackendStory): Scene {
  const content = story.content?.trim() || "Scene draft saved in the backend.";
  return {
    id: story.id,
    project_id: story.project_id,
    title: story.title,
    desc: content.length > 110 ? `${content.slice(0, 107)}...` : content,
    act: story.act || "Act I",
    status: story.status === "written" || story.status === "approved" ? story.status : "draft",
  };
}

function buildScenePrompt(project?: BackendProject | null) {
  return `Create a concise storyboard scene for ${project?.title || "this project"} with strong visual beats and a clear act transition.`;
}

export default function StoryboardPage() {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [stories, setStories] = useState<BackendStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const primaryProject = projects[0] ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadStoryboard() {
      setLoading(true);
      setError("");
      try {
        const projectsResponse = await projectsApi.list({ limit: 100 });
        const loadedProjects = projectsResponse.data.items as BackendProject[];
        if (!mounted) return;
        setProjects(loadedProjects);

        if (loadedProjects.length === 0) {
          setStories([]);
          return;
        }

        const response = await storiesApi.list(loadedProjects[0].id, { limit: 100 });
        if (!mounted) return;
        setStories(response.data.items as BackendStory[]);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.detail || "Failed to load storyboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadStoryboard();
    return () => {
      mounted = false;
    };
  }, []);

  const scenes = useMemo(() => stories.map(mapStoryToScene), [stories]);
  const acts = useMemo(() => [...new Set(scenes.map((scene) => scene.act))], [scenes]);

  async function refreshStories() {
    if (!primaryProject) return;
    const response = await storiesApi.list(primaryProject.id, { limit: 100 });
    setStories(response.data.items as BackendStory[]);
  }

  async function addScene() {
    if (!primaryProject || creating) return;
    setCreating(true);
    setError("");
    try {
      const response = await storiesApi.create(primaryProject.id, {
        title: `Scene ${scenes.length + 1}`,
        content: "",
        act: acts[0] || "Act I",
      });
      const created = response.data as BackendStory;
      setStories((current) => [created, ...current]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to add scene.");
    } finally {
      setCreating(false);
    }
  }

  async function suggestScene() {
    if (!primaryProject || suggesting) return;
    setSuggesting(true);
    setError("");
    try {
      await storiesApi.generate({
        project_id: primaryProject.id,
        prompt: buildScenePrompt(primaryProject),
        length: "short",
        save: true,
      });
      await refreshStories();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to suggest a scene.");
    } finally {
      setSuggesting(false);
    }
  }

  async function deleteScene(scene: Scene) {
    if (deletingId) return;
    if (!window.confirm(`Delete "${scene.title}"?`)) return;
    setDeletingId(scene.id);
    setError("");
    try {
      await storiesApi.delete(scene.project_id, scene.id);
      setStories((current) => current.filter((story) => story.id !== scene.id));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete scene.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-pink-300">
            <Film className="w-3.5 h-3.5" /> Storyboard
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Scene timeline</h1>
          <p className="text-slate-400 text-sm">
            {scenes.length} scenes across {acts.length} acts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={suggestScene}
            disabled={loading || suggesting || !primaryProject}
            className="btn-secondary text-sm px-4 py-2.5 rounded-xl disabled:opacity-40"
          >
            {suggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {suggesting ? "Suggesting..." : "AI suggest scene"}
          </button>
          <button
            onClick={addScene}
            disabled={loading || creating || !primaryProject}
            className="btn-primary text-sm px-4 py-2.5 rounded-xl disabled:opacity-40"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {creating ? "Creating..." : "Add scene"}
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-sm text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-2xl p-6 text-slate-400 text-sm">Loading saved scenes from the backend...</div>
      ) : scenes.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Film className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium mb-1">No storyboard scenes yet</p>
          <p className="text-slate-600 text-sm">Generate or create a scene to populate the timeline.</p>
        </div>
      ) : (
        acts.map((act, ai) => (
          <motion.div
            key={act}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ai * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{act}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-2.5">
              {scenes
                .filter((scene) => scene.act === act)
                .map((scene, i) => {
                  const st = STATUS_STYLE[scene.status];
                  return (
                    <motion.div
                      key={scene.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ai * 0.1 + i * 0.06 }}
                      className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all group cursor-pointer"
                    >
                      <GripVertical className="w-4 h-4 text-slate-700 flex-shrink-0 cursor-grab" />

                      <div className="flex-shrink-0 w-8 h-8 rounded-xl glass-card flex items-center justify-center text-xs font-bold text-slate-400">
                        {scenes.indexOf(scene) + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{scene.title}</p>
                        <p className="text-slate-500 text-xs truncate">{scene.desc}</p>
                      </div>

                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text} flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {scene.status}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/8 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => void deleteScene(scene)}
                          disabled={deletingId === scene.id}
                          className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/8 transition-colors disabled:opacity-40"
                        >
                          {deletingId === scene.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreHorizontal className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
