"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, Compass, Layers, Sparkles, Plus, Loader2 } from "lucide-react";
import { projectsApi, worldsApi } from "@/lib/api";

type BackendProject = {
  id: string;
  title: string;
  description?: string | null;
};

type BackendWorld = {
  id: string;
  project_id: string;
  name: string;
  description?: string | null;
  geography?: string | null;
  cultures?: string | null;
  history?: string | null;
  magic_system?: string | null;
  technology_level?: string | null;
  notable_locations: string[];
  updated_at: string;
};

type LayerKey = "geography" | "cultures" | "history" | "locations";

const layerMeta: Array<{
  key: LayerKey;
  icon: ElementType;
  label: string;
  desc: string;
  color: string;
}> = [
  { key: "geography", icon: Compass, label: "Geography", desc: "Continents, terrain, climate zones", color: "#059669" },
  { key: "cultures", icon: Layers, label: "Cultures", desc: "Civilisations, customs, religions", color: "#7c3aed" },
  { key: "history", icon: Globe, label: "History", desc: "Ages, wars, pivotal events", color: "#2563eb" },
  { key: "locations", icon: MapPin, label: "Locations", desc: "Cities, dungeons, landmarks", color: "#db2777" },
];

function splitLines(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildConcept(project?: BackendProject | null, world?: BackendWorld | null): string {
  return (
    world?.description?.trim() ||
    project?.description?.trim() ||
    project?.title?.trim() ||
    "A richly detailed world"
  );
}

export default function WorldBuilderPage() {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [worlds, setWorlds] = useState<BackendWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingSection, setUpdatingSection] = useState<LayerKey | null>(null);
  const [error, setError] = useState("");

  const primaryProject = projects[0] ?? null;
  const activeWorld = worlds[0] ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadWorlds() {
      setLoading(true);
      setError("");
      try {
        const projectsResponse = await projectsApi.list({ limit: 100 });
        const loadedProjects = projectsResponse.data.items as BackendProject[];
        if (!mounted) return;
        setProjects(loadedProjects);

        if (loadedProjects.length === 0) {
          setWorlds([]);
          return;
        }

        const worldsResponse = await worldsApi.list(loadedProjects[0].id, { limit: 100 });
        if (!mounted) return;
        setWorlds((worldsResponse.data.items as BackendWorld[]).sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ));
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.detail || "Failed to load worlds.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadWorlds();
    return () => {
      mounted = false;
    };
  }, []);

  const worldItems = useMemo(() => {
    const geography = splitLines(activeWorld?.geography);
    const cultures = splitLines(activeWorld?.cultures);
    const history = splitLines(activeWorld?.history);
    const locations =
      activeWorld?.notable_locations?.length
        ? activeWorld.notable_locations
        : activeWorld
          ? splitLines(activeWorld.description)
          : [];

    return {
      geography: geography.length ? geography : activeWorld ? [activeWorld.description || "No geography yet."] : [],
      cultures: cultures.length ? cultures : activeWorld ? [activeWorld.magic_system || "No cultures yet."] : [],
      history: history.length ? history : activeWorld ? [activeWorld.technology_level || "No history yet."] : [],
      locations: locations.length ? locations : activeWorld ? ["No notable locations yet."] : [],
    } satisfies Record<LayerKey, string[]>;
  }, [activeWorld]);

  async function generateWorld() {
    if (!primaryProject || generating) return;
    setGenerating(true);
    setError("");
    try {
      const response = await worldsApi.generate({
        project_id: primaryProject.id,
        concept: buildConcept(primaryProject, activeWorld),
        sections: ["geography", "cultures", "history", "magic_system", "technology_level"],
      });
      const saved = response.data.world as BackendWorld;
      setWorlds((current) => [saved, ...current.filter((world) => world.id !== saved.id)]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to generate world lore.");
    } finally {
      setGenerating(false);
    }
  }

  async function expandLayer(layer: LayerKey) {
    if (!activeWorld || updatingSection) return;
    setUpdatingSection(layer);
    setError("");
    try {
      if (layer === "locations") {
        const nextLocation = `${activeWorld.name} location ${activeWorld.notable_locations.length + 1}`;
        const response = await worldsApi.update(activeWorld.project_id, activeWorld.id, {
          notable_locations: [...activeWorld.notable_locations, nextLocation],
        });
        const updatedWorld = response.data as BackendWorld;
        setWorlds((current) =>
          current.map((world) => (world.id === updatedWorld.id ? updatedWorld : world))
        );
        return;
      }

      const response = await worldsApi.expandSection(activeWorld.id, layer, {
        concept: buildConcept(primaryProject, activeWorld),
      });
      const updatedWorld = response.data as BackendWorld;
      setWorlds((current) =>
        current.map((world) => (world.id === updatedWorld.id ? updatedWorld : world))
      );
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to expand world section.");
    } finally {
      setUpdatingSection(null);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-emerald-300">
          <Globe className="w-3.5 h-3.5" /> World Builder
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Build your world</h1>
        <p className="text-slate-400">
          Define the geography, cultures, history and lore that make your world breathe.
        </p>
      </motion.div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-sm text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{
          background: "linear-gradient(135deg,rgba(5,150,105,0.15),rgba(37,99,235,0.10))",
          border: "1px solid rgba(5,150,105,0.2)",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#059669,#0891b2)" }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-base mb-1">Generate world lore with AI</h3>
          <p className="text-slate-400 text-sm">
            Describe the kind of world you want and IBM Granite will generate geography, cultures, and history.
          </p>
        </div>
        <button
          onClick={generateWorld}
          disabled={loading || generating || !primaryProject}
          className="btn-primary text-sm px-5 py-2.5 rounded-2xl flex-shrink-0 disabled:opacity-40"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Generating..." : "Generate lore"}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {layerMeta.map((layer, i) => {
          const items = worldItems[layer.key];
          return (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="glass-card rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
            >
              <div className="h-1" style={{ background: `linear-gradient(90deg,${layer.color},${layer.color}44)` }} />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${layer.color}22`, border: `1px solid ${layer.color}33` }}
                  >
                    <layer.icon className="w-5 h-5" style={{ color: layer.color }} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{layer.label}</p>
                    <p className="text-slate-500 text-xs">{layer.desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors cursor-pointer group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                      <span className="truncate flex-1">{item}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => void expandLayer(layer.key)}
                    disabled={!activeWorld || updatingSection !== null}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors px-1 py-1 group disabled:opacity-40"
                  >
                    {updatingSection === layer.key ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Add {layer.label.toLowerCase()}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
