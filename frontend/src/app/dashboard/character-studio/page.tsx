"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Sparkles, Wand2, ArrowRight, X } from "lucide-react";

type Character = { id: string; name: string; role: string; age: string; trait: string; color: string };

const INITIAL: Character[] = [
  { id: "1", name: "Aelindra Voss",   role: "Protagonist",   age: "28", trait: "Determined & reckless",    color: "#7c3aed" },
  { id: "2", name: "Lord Casten",     role: "Antagonist",    age: "54", trait: "Calculating & ruthless",   color: "#dc2626" },
  { id: "3", name: "Mira of the Ash", role: "Mentor",        age: "70", trait: "Wise & cryptic",           color: "#0891b2" },
  { id: "4", name: "Brennan Foyle",   role: "Ally",          age: "32", trait: "Loyal & overconfident",    color: "#059669" },
];
const ROLES = ["Protagonist", "Antagonist", "Ally", "Mentor", "Love Interest", "Foil", "Other"];
const COLORS = ["#7c3aed","#2563eb","#db2777","#0891b2","#d97706","#059669","#dc2626"];

export default function CharacterStudioPage() {
  const [characters, setCharacters] = useState<Character[]>(INITIAL);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Protagonist", age: "", trait: "" });

  function create() {
    if (!form.name.trim()) return;
    setCharacters(p => [...p, {
      id: String(Date.now()), ...form,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }]);
    setForm({ name: "", role: "Protagonist", age: "", trait: "" });
    setModal(false);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-blue-300">
            <Users className="w-3.5 h-3.5" /> Character Studio
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Your cast</h1>
          <p className="text-slate-400 text-sm">{characters.length} characters across all projects</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setModal(true)}
          className="btn-primary px-5 py-2.5 rounded-2xl text-sm">
          <Plus className="w-4 h-4" /> New character
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((c, i) => (
          <motion.div key={c.id}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all hover:-translate-y-1 group"
          >
            <div className="h-1.5" style={{ background: `linear-gradient(90deg,${c.color},${c.color}44)` }} />
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${c.color},${c.color}88)` }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{c.name}</p>
                  <p className="text-xs" style={{ color: c.color }}>{c.role}</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-slate-400">
                <span>Age: <span className="text-slate-300">{c.age || "—"}</span></span>
              </div>
              <p className="text-slate-400 text-xs italic">"{c.trait}"</p>
              <button className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: `${c.color}15`, border: `1px solid ${c.color}30`, color: c.color }}>
                <Sparkles className="w-3 h-3" /> Generate backstory
              </button>
            </div>
          </motion.div>
        ))}

        {/* Add card */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          onClick={() => setModal(true)}
          className="glass-card rounded-2xl p-5 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-purple-500/30 transition-all min-h-[180px]">
          <Plus className="w-8 h-8" />
          <span className="text-sm font-medium">Add character</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
              className="w-full max-w-md glass-card rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">New character</h2>
                <button onClick={() => setModal(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Name", key: "name", placeholder: "e.g. Aelindra Voss" },
                  { label: "Age",  key: "age",  placeholder: "e.g. 28" },
                  { label: "Core trait", key: "trait", placeholder: "e.g. Determined & reckless" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">{label}</label>
                    <input value={(form as Record<string,string>)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0d1a] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center py-2.5 rounded-xl text-sm">Cancel</button>
                  <button onClick={create} disabled={!form.name.trim()} className="btn-primary flex-1 justify-center py-2.5 rounded-xl text-sm disabled:opacity-40">Create</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
