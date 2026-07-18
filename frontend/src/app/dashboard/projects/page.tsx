"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FolderOpen, Trash2, ArrowRight, Clock } from "lucide-react";
import Badge from "@/components/Badge";
import Link from "next/link";
import { projectsApi } from "@/lib/api";

type ProjectStatus = "active" | "completed" | "draft";

type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  count: number;
  updatedAt: string;
};

type BackendProject = {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  scene_count: number;
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

function toUiProject(project: BackendProject): Project {
  return {
    id: project.id,
    name: project.title,
    description: project.description || "No description yet.",
    status: project.status,
    count: project.scene_count,
    updatedAt: formatRelativeDate(project.updated_at),
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      setLoading(true);
      setError("");
      try {
        const response = await projectsApi.list({ limit: 100 });
        if (!mounted) return;
        setProjects((response.data.items as BackendProject[]).map(toUiProject));
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.detail || "Failed to load projects.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  async function createProject() {
    if (!newProject.name.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await projectsApi.create({
        title: newProject.name.trim(),
        description: newProject.description.trim() || undefined,
        status: "draft",
      });
      setProjects((prev) => [toUiProject(response.data as BackendProject), ...prev]);
      setNewProject({ name: "", description: "" });
      setShowModal(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create project.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: string) {
    setError("");
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete project.");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} projects total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          New project
        </button>
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-sm text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-3 max-w-sm">
        <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none w-full"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-medium">Loading projects from the backend...</p>
          </div>
        ) : (
          filtered.map((project) => (
            <div key={project.id} className="glass-card rounded-2xl p-5 flex flex-col gap-4 group hover:border-purple-500/30 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20">
                  <FolderOpen className="w-5 h-5 text-purple-400" />
                </div>
                <Badge variant={project.status === "active" ? "green" : project.status === "completed" ? "blue" : "default"}>
                  {project.status}
                </Badge>
              </div>

              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{project.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{project.count} scenes</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {project.updatedAt}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Open <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">No projects found</p>
            <p className="text-slate-600 text-sm">Try adjusting your search or create a new project.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-purple-500/20">
            <h2 className="text-lg font-bold text-white mb-4">New project</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Project name</label>
                <input
                  value={newProject.name}
                  onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                  placeholder="My awesome project"
                  className="w-full rounded-xl border border-white/10 bg-brand-dark/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Description (optional)</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                  placeholder="What are you working on?"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-brand-dark/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!newProject.name.trim() || saving}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {saving ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
