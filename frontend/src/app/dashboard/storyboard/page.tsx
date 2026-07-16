"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Plus, GripVertical, Sparkles, Eye, MoreHorizontal } from "lucide-react";

type Scene = { id: string; title: string; desc: string; act: string; status: "draft" | "written" | "approved" };
const INITIAL_SCENES: Scene[] = [
  { id: "1", title: "The Dark Throne Room",  desc: "Aelindra confronts the Pale Flame.",                act: "Act I",   status: "approved" },
  { id: "2", title: "Flight from Ironhaven", desc: "Chase through the lower districts at dawn.",        act: "Act I",   status: "written"  },
  { id: "3", title: "The Ash Plains",        desc: "The party crosses the forsaken territory.",         act: "Act II",  status: "draft"    },
  { id: "4", title: "Meeting Mira",          desc: "An unlikely mentor emerges from exile.",            act: "Act II",  status: "draft"    },
  { id: "5", title: "The Vault Opens",       desc: "Ancient magic is unleashed beneath the mountain.", act: "Act III", status: "draft"    },
];
const STATUS_STYLE: Record<Scene["status"], { bg: string; text: string; dot: string }> = {
  draft:    { bg: "bg-white/5",        text: "text-slate-400",  dot: "bg-slate-500"   },
  written:  { bg: "bg-blue-500/10",    text: "text-blue-300",   dot: "bg-blue-400"    },
  approved: { bg: "bg-emerald-500/10", text: "text-emerald-300",dot: "bg-emerald-400" },
};

export default function StoryboardPage() {
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const acts = [...new Set(scenes.map(s => s.act))];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-pink-300">
            <Film className="w-3.5 h-3.5" /> Storyboard
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Scene timeline</h1>
          <p className="text-slate-400 text-sm">{scenes.length} scenes across {acts.length} acts</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm px-4 py-2.5 rounded-xl">
            <Sparkles className="w-4 h-4" /> AI suggest scene
          </button>
          <button className="btn-primary text-sm px-4 py-2.5 rounded-xl">
            <Plus className="w-4 h-4" /> Add scene
          </button>
        </div>
      </motion.div>

      {acts.map((act, ai) => (
        <motion.div key={act}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ai * 0.1 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{act}</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="space-y-2.5">
            {scenes.filter(s => s.act === act).map((scene, i) => {
              const st = STATUS_STYLE[scene.status];
              return (
                <motion.div key={scene.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
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
                    <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/8 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/8 transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
