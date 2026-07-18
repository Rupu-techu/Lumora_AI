"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Sparkles, X, Loader2 } from "lucide-react";
import { charactersApi, projectsApi } from "@/lib/api";

type BackendProject = {
  id: string;
  title: string;
};

type BackendCharacter = {
  id: string;
  project_id: string;
  name: string;
  role: string;
  age?: string | null;
  personality?: string | null;
  backstory?: string | null;
  updated_at: string;
};

type CharacterForm = {
  name: string;
  role: string;
  age: string;
  trait: string;
};

const ROLES = ["Protagonist", "Antagonist", "Ally", "Mentor", "Love Interest", "Foil", "Other"];
const COLORS = ["#7c3aed", "#2563eb", "#db2777", "#0891b2", "#d97706", "#059669", "#dc2626"];

function pickColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

function toForm(character?: BackendCharacter | null): CharacterForm {
  return {
    name: character?.name ?? "",
    role: character?.role ?? "Protagonist",
    age: character?.age ?? "",
    trait: character?.personality ?? "",
  };
}

export default function CharacterStudioPage() {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [characters, setCharacters] = useState<BackendCharacter[]>([]);
  const [modal, setModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<BackendCharacter | null>(null);
  const [form, setForm] = useState<CharacterForm>(toForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backstoryingId, setBackstoryingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const primaryProject = projects[0] ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadCharacters() {
      setLoading(true);
      setError("");
      try {
        const projectsResponse = await projectsApi.list({ limit: 100 });
        const loadedProjects = projectsResponse.data.items as BackendProject[];

        if (!mounted) return;
        setProjects(loadedProjects);

        if (loadedProjects.length === 0) {
          setCharacters([]);
          return;
        }

        const responses = await Promise.all(
          loadedProjects.map((project) => charactersApi.list(project.id, { limit: 100 }))
        );
        const loadedCharacters = responses.flatMap(
          (response) => response.data.items as BackendCharacter[]
        );

        if (!mounted) return;
        setCharacters(
          loadedCharacters.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
        );
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.detail || "Failed to load characters.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadCharacters();
    return () => {
      mounted = false;
    };
  }, []);

  function openCreateModal() {
    setEditingCharacter(null);
    setForm(toForm());
    setModal(true);
  }

  function openEditModal(character: BackendCharacter) {
    setEditingCharacter(character);
    setForm(toForm(character));
    setModal(true);
  }

  async function submitCharacter() {
    if (!form.name.trim() || saving) return;
    if (!editingCharacter && !primaryProject) {
      setError("Create a project first to add characters.");
      return;
    }

    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      role: form.role,
      age: form.age.trim() || undefined,
      personality: form.trait.trim() || undefined,
    };

    try {
      if (editingCharacter) {
        const response = await charactersApi.update(
          editingCharacter.project_id,
          editingCharacter.id,
          payload
        );
        const updated = response.data as BackendCharacter;
        setCharacters((current) =>
          current.map((character) => (character.id === updated.id ? updated : character))
        );
      } else if (primaryProject) {
        const response = await charactersApi.create(primaryProject.id, payload);
        const created = response.data as BackendCharacter;
        setCharacters((current) => [created, ...current]);
      }
      setModal(false);
      setEditingCharacter(null);
      setForm(toForm());
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save character.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCharacter() {
    if (!editingCharacter || deletingId) return;
    setDeletingId(editingCharacter.id);
    setError("");
    try {
      await charactersApi.delete(editingCharacter.project_id, editingCharacter.id);
      setCharacters((current) => current.filter((character) => character.id !== editingCharacter.id));
      setModal(false);
      setEditingCharacter(null);
      setForm(toForm());
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete character.");
    } finally {
      setDeletingId(null);
    }
  }

  async function generateBackstory(character: BackendCharacter) {
    if (backstoryingId) return;
    setBackstoryingId(character.id);
    setError("");
    try {
      const response = await charactersApi.generateBackstory(character.id, {
        character_id: character.id,
        style: "detailed",
      });
      const updatedCharacter = response.data.character as BackendCharacter;
      setCharacters((current) =>
        current.map((item) => (item.id === updatedCharacter.id ? updatedCharacter : item))
      );
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to generate backstory.");
    } finally {
      setBackstoryingId(null);
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
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-blue-300">
            <Users className="w-3.5 h-3.5" /> Character Studio
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Your cast</h1>
          <p className="text-slate-400 text-sm">{characters.length} characters across all projects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={openCreateModal}
          disabled={loading || !primaryProject}
          className="btn-primary px-5 py-2.5 rounded-2xl text-sm disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> New character
        </motion.button>
      </motion.div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-sm text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full glass-card rounded-2xl p-6 text-slate-400 text-sm">
            Loading saved characters from the backend...
          </div>
        ) : (
          <>
            {characters.map((character, i) => {
              const color = pickColor(character.id + character.name);
              return (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all hover:-translate-y-1 group cursor-pointer"
                  onClick={() => openEditModal(character)}
                >
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg,${color},${color}44)` }} />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${color},${color}88)` }}
                      >
                        {character.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{character.name}</p>
                        <p className="text-xs" style={{ color }}>{character.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>
                        Age: <span className="text-slate-300">{character.age || "—"}</span>
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs italic">
                      "{character.personality || character.backstory || "No personality note yet."}"
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void generateBackstory(character);
                      }}
                      disabled={backstoryingId === character.id}
                      className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                    >
                      {backstoryingId === character.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {backstoryingId === character.id ? "Generating..." : "Generate backstory"}
                    </button>
                  </div>
                </motion.div>
              );
            })}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={openCreateModal}
              disabled={!primaryProject}
              className="glass-card rounded-2xl p-5 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-purple-500/30 transition-all min-h-[180px] disabled:opacity-40"
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Add character</span>
            </motion.button>
          </>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md glass-card rounded-3xl p-6 border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">
                  {editingCharacter ? "Edit character" : "New character"}
                </h2>
                <button
                  onClick={() => setModal(false)}
                  className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Name", key: "name", placeholder: "e.g. Aelindra Voss" },
                  { label: "Age", key: "age", placeholder: "e.g. 28" },
                  { label: "Core trait", key: "trait", placeholder: "e.g. Determined & reckless" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">{label}</label>
                    <input
                      value={form[key as keyof CharacterForm]}
                      onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  >
                    {ROLES.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  {editingCharacter ? (
                    <button
                      onClick={deleteCharacter}
                      disabled={saving || deletingId === editingCharacter.id}
                      className="btn-secondary flex-1 justify-center py-2.5 rounded-xl text-sm disabled:opacity-40"
                    >
                      {deletingId === editingCharacter.id ? "Deleting..." : "Delete"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setModal(false)}
                      className="btn-secondary flex-1 justify-center py-2.5 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={submitCharacter}
                    disabled={!form.name.trim() || saving}
                    className="btn-primary flex-1 justify-center py-2.5 rounded-xl text-sm disabled:opacity-40"
                  >
                    {saving ? "Saving..." : editingCharacter ? "Save changes" : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
