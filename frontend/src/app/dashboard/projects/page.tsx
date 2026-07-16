"use client";

import { useState } from "react";
import { Plus, Search, FolderOpen, Trash2, ArrowRight, Clock } from "lucide-react";
import Badge from "@/components/Badge";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "draft";
  count: number;
  updatedAt: string;
};

const initialProjects: Project[] = [
  { id: "1", name: "Brand Campaign v2", description: "Marketing visuals for Q1 2025 launch", status: "active", count: 34, updatedAt: "2 hours ago" },
  { id: "2", name: "Product Renders", description: "3D-style product shots for e-commerce", status: "active", count: 18, updatedAt: "Yesterday" },
  { id: "3", name: "Social Media Pack", description: "Instagram & LinkedIn templates", status: "completed", count: 52, updatedAt: "3 days ago" },
  { id: "4", name: "UI Illustrations", description: "Custom illustration set for SaaS product", status: "draft", count: 9, updatedAt: "1 week ago" },
  { id: "5", name: "Ad Creatives", description: "Google & Meta display ads", status: "active", count: 27, updatedAt: "4 hours ago" },
  { id: "6", name: "Logo Explorations", description: "Brand identity variants", status: "draft", count: 5, updatedAt: "2 weeks ago" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  function createProject() {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: String(Date.now()),
      name: newProject.name,
      description: newProject.description,
      status: "draft",
      count: 0,
      updatedAt: "Just now",
    };
    setProjects((prev) => [project, ...prev]);
    setNewProject({ name: "", description: "" });
    setShowModal(false);
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
        {filtered.map((project) => (
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
              <span>{project.count} images</span>
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
        ))}

        {filtered.length === 0 && (
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
                  disabled={!newProject.name.trim()}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
