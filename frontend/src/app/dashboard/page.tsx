"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus, Sparkles, BookOpen, Users, Globe, Film,
  Wand2, ArrowRight, Clock, MoreHorizontal, Star,
  TrendingUp, Zap, FolderOpen, Eye, Pencil, Trash2,
  ChevronRight, X, Download,
} from "lucide-react";
import Badge from "@/components/Badge";

/* ─── types ─── */
type ProjectStatus = "active" | "completed" | "draft";
type Project = {
  id: string; name: string; description: string;
  status: ProjectStatus; scenes: number; characters: number;
  updatedAt: string; color: string; tag: string;
};

/* ─── data ─── */
const TOOLS = [
  { label: "Story Generator",  href: "/dashboard/story-generator",  icon: BookOpen, gradient: "from-violet-500 to-purple-600",  desc: "Generate full story arcs with AI" },
  { label: "Character Studio", href: "/dashboard/character-studio", icon: Users,    gradient: "from-blue-500 to-cyan-500",       desc: "Design & develop characters"      },
  { label: "World Builder",    href: "/dashboard/world-builder",    icon: Globe,    gradient: "from-emerald-500 to-teal-500",    desc: "Build rich, detailed worlds"      },
  { label: "Storyboard",       href: "/dashboard/storyboard",       icon: Film,     gradient: "from-pink-500 to-rose-500",       desc: "Visualise scenes & sequences"     },
  { label: "Prompt Studio",    href: "/dashboard/prompt-studio",    icon: Wand2,    gradient: "from-amber-500 to-orange-500",    desc: "Craft & refine AI prompts"        },
];

const STATS = [
  { label: "Active projects", value: "7",   delta: "+2 this week",  icon: FolderOpen,  color: "text-purple-400", bg: "from-purple-500/20 to-purple-500/5" },
  { label: "Scenes created",  value: "142", delta: "+18 today",     icon: Film,        color: "text-blue-400",   bg: "from-blue-500/20 to-blue-500/5"     },
  { label: "Characters",      value: "38",  delta: "+5 this week",  icon: Users,       color: "text-pink-400",   bg: "from-pink-500/20 to-pink-500/5"     },
  { label: "AI generations",  value: "3.2K",delta: "+34%",          icon: Sparkles,    color: "text-amber-400",  bg: "from-amber-500/20 to-amber-500/5"   },
];

const INITIAL_PROJECTS: Project[] = [
  { id: "1", name: "The Hollow Crown",      description: "A dark fantasy epic about a kingdom lost to shadow magic.", status: "active",    scenes: 14, characters: 6,  updatedAt: "2 hours ago",  color: "#7c3aed", tag: "Fantasy"   },
  { id: "2", name: "Project Nebula",        description: "Sci-fi thriller set aboard a derelict space freighter.",    status: "active",    scenes: 8,  characters: 4,  updatedAt: "Yesterday",    color: "#2563eb", tag: "Sci-Fi"    },
  { id: "3", name: "Red Door Chronicles",   description: "Anthology of mystery short stories set in 1920s London.",   status: "completed", scenes: 22, characters: 11, updatedAt: "3 days ago",   color: "#db2777", tag: "Mystery"   },
  { id: "4", name: "Iron Bloom",            description: "Coming-of-age drama about a young blacksmith in feudal Japan.", status: "draft", scenes: 3,  characters: 2,  updatedAt: "1 week ago",   color: "#0891b2", tag: "Drama"     },
  { id: "5", name: "Glass Meridian",        description: "Psychological thriller with an unreliable narrator.",        status: "active",    scenes: 11, characters: 5,  updatedAt: "4 hours ago",  color: "#d97706", tag: "Thriller"  },
  { id: "6", name: "Ember & Ash",           description: "Post-apocalyptic romance with magical realism elements.",    status: "draft",     scenes: 2,  characters: 3,  updatedAt: "2 weeks ago",  color: "#059669", tag: "Romance"   },
];

const STATUS_BADGE: Record<ProjectStatus, "green" | "blue" | "default"> = {
  active: "green", completed: "blue", draft: "default",
};

/* ─── sub-components ─── */

function StatCard({
  label, value, delta, icon: Icon, color, bg, delay,
}: (typeof STATS)[0] & { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">{label}</span>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-white mb-0.5">{value}</div>
        <div className="text-xs text-emerald-400 font-medium">{delta}</div>
      </div>
    </motion.div>
  );
}

function ToolCard({
  label, href, icon: Icon, gradient, desc, delay,
}: (typeof TOOLS)[0] & { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="flex items-center gap-4 glass-card rounded-2xl p-4 group hover:border-purple-500/40 transition-all duration-200 hover:-translate-y-0.5"
      >
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">{label}</p>
          <p className="text-slate-500 text-xs mt-0.5 truncate">{desc}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

function ProjectCard({
  project,
  onDelete,
  delay,
}: {
  project: Project;
  onDelete: (id: string) => void;
  delay: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      layout
      className="glass-card rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ boxShadow: menuOpen ? `0 0 0 1px ${project.color}55` : undefined }}
    >
      {/* Colour header bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}55)` }}
      />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-white font-bold text-base truncate">{project.name}</h3>
              <Badge variant={STATUS_BADGE[project.status]}>{project.status}</Badge>
            </div>
            <span
              className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                color: project.color,
                borderColor: project.color + "44",
                background: project.color + "18",
              }}
            >
              {project.tag}
            </span>
          </div>

          {/* Kebab menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 z-20 w-36 glass-card rounded-xl py-1 shadow-xl border border-white/10"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {[
                    { label: "Open",   icon: Eye,    href: `/dashboard/projects/${project.id}` },
                    { label: "Edit",   icon: Pencil, href: `/dashboard/projects/${project.id}/edit` },
                    { label: "Export", icon: Download, href: `/dashboard/exports` },
                  ].map(({ label, icon: Icon, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </Link>
                  ))}
                  <div className="my-1 mx-2 h-px bg-white/5" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(project.id); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">
          {project.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Film className="w-3 h-3" /> {project.scenes} scenes
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {project.characters} chars
            </span>
          </div>
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-3 h-3" /> {project.updatedAt}
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 group-hover:text-white"
          style={{
            background: `linear-gradient(135deg, ${project.color}20, ${project.color}10)`,
            border: `1px solid ${project.color}30`,
            color: project.color,
          }}
        >
          Open project <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── "Create New Project" modal ─── */
const TEMPLATES = [
  { id: "blank",    label: "Blank",          icon: "✦", desc: "Start from scratch" },
  { id: "fantasy",  label: "Fantasy Epic",   icon: "🐉", desc: "Medieval world, magic, heroes" },
  { id: "scifi",    label: "Sci-Fi Thriller",icon: "🚀", desc: "Space, tech, tension" },
  { id: "mystery",  label: "Mystery",        icon: "🔍", desc: "Clues, suspects, twists" },
  { id: "romance",  label: "Romance",        icon: "❤", desc: "Emotion-driven character arcs" },
  { id: "horror",   label: "Horror",         icon: "👁", desc: "Atmosphere, dread, suspense" },
];

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: Project) => void;
}) {
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [template, setTemplate]   = useState("blank");
  const [step, setStep]           = useState<1 | 2>(1);

  function handleCreate() {
    if (!name.trim()) return;
    const tpl = TEMPLATES.find((t) => t.id === template)!;
    const colors = ["#7c3aed","#2563eb","#db2777","#0891b2","#d97706","#059669"];
    onCreate({
      id: String(Date.now()),
      name: name.trim(),
      description: desc.trim() || tpl.desc,
      status: "draft",
      scenes: 0,
      characters: 0,
      updatedAt: "Just now",
      color: colors[Math.floor(Math.random() * colors.length)],
      tag: tpl.label === "Blank" ? "Other" : tpl.label,
    });
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl glass-card rounded-3xl overflow-hidden border border-purple-500/20 shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-lg">New project</h2>
            <p className="text-slate-500 text-xs mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1 — template */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-6 space-y-4"
            >
              <p className="text-slate-300 text-sm font-medium">Choose a template</p>
              <div className="grid grid-cols-3 gap-2.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left transition-all ${
                      template === t.id
                        ? "border-purple-500/60 text-white"
                        : "border-white/8 text-slate-400 hover:border-white/18 hover:text-white"
                    }`}
                    style={template === t.id ? { background: "rgba(124,58,237,0.15)" } : { background: "rgba(255,255,255,0.02)" }}
                  >
                    <span className="text-2xl leading-none">{t.icon}</span>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{t.label}</p>
                      <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{t.desc}</p>
                    </div>
                    {template === t.id && (
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                        <span className="text-white text-[8px] font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary px-6 py-2.5 text-sm rounded-xl"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Project name <span className="text-red-400">*</span></label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. The Hollow Crown"
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Description <span className="text-slate-600">(optional)</span></label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="A brief description of your story..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3 rounded-xl text-sm">
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="btn-primary flex-1 justify-center py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  Create project
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ─── main page ─── */
export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | ProjectStatus>("all");

  const filtered = activeFilter === "all"
    ? projects
    : projects.filter((p) => p.status === activeFilter);

  function handleDelete(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function handleCreate(p: Project) {
    setProjects((prev) => [p, ...prev]);
  }

  const FILTERS: Array<{ key: "all" | ProjectStatus; label: string }> = [
    { key: "all",       label: `All (${projects.length})` },
    { key: "active",    label: "Active"     },
    { key: "draft",     label: "Drafts"     },
    { key: "completed", label: "Completed"  },
  ];

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">

      {/* ── Welcome header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
            Good morning, <span className="gradient-text">Jane</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            You have <span className="text-white font-medium">{projects.filter(p => p.status === "active").length} active projects</span> — keep creating.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setModalOpen(true)}
          className="btn-primary self-start sm:self-auto px-6 py-3 rounded-2xl text-sm shadow-[0_0_30px_rgba(124,58,237,0.35)]"
        >
          <Plus className="w-4 h-4" />
          Create new project
        </motion.button>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={0.05 * i} />)}
      </div>

      {/* ── Create CTA banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(37,99,235,0.14) 100%)",
          border: "1px solid rgba(124,58,237,0.25)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute right-0 top-0 w-64 h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-12 right-8 w-40 h-40 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
          <div className="absolute -bottom-8 right-24 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle,#2563eb,transparent)" }} />
        </div>

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 relative z-10 min-w-0">
          <h2 className="text-white font-bold text-xl mb-1">Start your next story</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
            Choose a template, name your world, and let Imaginex AI help you build characters, scenes, and narrative arcs — powered by IBM Granite.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalOpen(true)}
          className="btn-primary relative z-10 flex-shrink-0 px-7 py-3 rounded-2xl text-sm"
        >
          <Plus className="w-4 h-4" />
          New project
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* ── Two-column layout: projects + tools ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Left: projects (2/3) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-bold text-white">Recent projects</h2>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    activeFilter === key
                      ? "text-white border-purple-500/50"
                      : "text-slate-400 border-white/8 hover:border-white/18"
                  }`}
                  style={activeFilter === key ? { background: "rgba(124,58,237,0.18)" } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {filtered.map((project, i) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={handleDelete}
                    delay={i * 0.05}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-2xl p-12 text-center"
              >
                <FolderOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-medium mb-1">No projects found</p>
                <p className="text-slate-600 text-sm mb-4">
                  {activeFilter === "all" ? "Create your first project to get started." : `No ${activeFilter} projects.`}
                </p>
                <button onClick={() => setModalOpen(true)} className="btn-primary text-sm px-5 py-2.5 rounded-xl">
                  <Plus className="w-4 h-4" /> New project
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length > 0 && (
            <div className="flex justify-center pt-1">
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors group"
              >
                View all projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Right: tools (1/3) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Creator tools</h2>
          <div className="flex flex-col gap-2.5">
            {TOOLS.map((tool, i) => (
              <ToolCard key={tool.href} {...tool} delay={0.1 + i * 0.06} />
            ))}
          </div>

          {/* Granite callout */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="glass-card rounded-2xl p-4 relative overflow-hidden mt-2"
          >
            <div className="absolute inset-0 opacity-8"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">IBM Granite active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-auto shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">
                Your AI foundation model is ready. Generate stories, characters, and world lore instantly.
              </p>
              <Link
                href="/dashboard/prompt-studio"
                className="btn-primary text-xs px-4 py-2 rounded-xl w-full justify-center"
              >
                Open Prompt Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <CreateModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />
        )}
      </AnimatePresence>
    </div>
  );
}
