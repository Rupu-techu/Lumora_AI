"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Wand2, Layers, Clock } from "lucide-react";
import Link from "next/link";

const genres = ["Fantasy", "Sci-Fi", "Mystery", "Romance", "Horror", "Drama", "Thriller", "Adventure"];
const recentStories = [
  { title: "The Hollow Crown — Act I",   genre: "Fantasy",  words: 2840, updatedAt: "2h ago" },
  { title: "Project Nebula — Prologue",  genre: "Sci-Fi",   words: 1200, updatedAt: "Yesterday" },
  { title: "Red Door Chronicles — Ch.3", genre: "Mystery",  words: 3500, updatedAt: "3 days ago" },
];

export default function StoryGeneratorPage() {
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
        <p className="text-slate-400">Describe a concept and let IBM Granite craft a complete narrative arc.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55 }}
        className="glass-card rounded-3xl p-6 space-y-5"
      >
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">Story prompt</label>
          <textarea
            rows={4}
            placeholder="A disgraced knight discovers an ancient map that leads to a weapon capable of ending a centuries-long war..."
            className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Genre</label>
            <select className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {genres.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Length</label>
            <select className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {["Short (500w)", "Medium (1500w)", "Long (3000w)", "Epic (5000w+)"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Tone</label>
            <select className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {["Dark", "Hopeful", "Humorous", "Tense", "Lyrical"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">POV</label>
            <select className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
              {["First person", "Third limited", "Third omniscient"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="btn-primary w-full justify-center py-3.5 rounded-2xl text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Generate story with IBM Granite
        </motion.button>
      </motion.div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent stories</h2>
        <div className="space-y-3">
          {recentStories.map((s, i) => (
            <motion.div
              key={s.title}
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
                  <span className="text-xs text-purple-400">{s.genre}</span>
                  <span className="text-xs text-slate-500">{s.words.toLocaleString()} words</span>
                  <span className="flex items-center gap-1 text-xs text-slate-600"><Clock className="w-3 h-3" />{s.updatedAt}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
