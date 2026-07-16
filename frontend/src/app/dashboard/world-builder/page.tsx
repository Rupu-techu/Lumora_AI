"use client";

import { motion } from "framer-motion";
import { Globe, MapPin, Compass, Layers, Sparkles, Plus } from "lucide-react";

const worldLayers = [
  { icon: Compass, label: "Geography",  desc: "Continents, terrain, climate zones",           color: "#059669", items: ["Northern Wastes", "The Ashfield Plains", "Sunken Isle of Vael"] },
  { icon: Layers,  label: "Cultures",   desc: "Civilisations, customs, religions",            color: "#7c3aed", items: ["The Thornborn Clans", "Order of Pale Flame", "Free Cities of Maren"] },
  { icon: Globe,   label: "History",    desc: "Ages, wars, pivotal events",                   color: "#2563eb", items: ["The Sundering War (840 AU)", "Rise of the Iron Throne", "Age of Silence"] },
  { icon: MapPin,  label: "Locations",  desc: "Cities, dungeons, landmarks",                  color: "#db2777", items: ["Ironhaven Capital", "The Whispering Vault", "Ember Gate Pass"] },
];

export default function WorldBuilderPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-emerald-300">
          <Globe className="w-3.5 h-3.5" /> World Builder
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Build your world</h1>
        <p className="text-slate-400">Define the geography, cultures, history and lore that make your world breathe.</p>
      </motion.div>

      {/* AI generate world button */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: "linear-gradient(135deg,rgba(5,150,105,0.15),rgba(37,99,235,0.10))", border: "1px solid rgba(5,150,105,0.2)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#059669,#0891b2)" }}>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-base mb-1">Generate world lore with AI</h3>
          <p className="text-slate-400 text-sm">Describe the kind of world you want and IBM Granite will generate geography, cultures, and history.</p>
        </div>
        <button className="btn-primary text-sm px-5 py-2.5 rounded-2xl flex-shrink-0">
          <Sparkles className="w-4 h-4" /> Generate lore
        </button>
      </motion.div>

      {/* World layers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {worldLayers.map((layer, i) => (
          <motion.div key={layer.label}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="glass-card rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
          >
            <div className="h-1" style={{ background: `linear-gradient(90deg,${layer.color},${layer.color}44)` }} />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${layer.color}22`, border: `1px solid ${layer.color}33` }}>
                  <layer.icon className="w-5 h-5" style={{ color: layer.color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{layer.label}</p>
                  <p className="text-slate-500 text-xs">{layer.desc}</p>
                </div>
              </div>
              <div className="space-y-2">
                {layer.items.map(item => (
                  <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors cursor-pointer group">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                    <span className="truncate flex-1">{item}</span>
                  </div>
                ))}
                <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors px-1 py-1 group">
                  <Plus className="w-3.5 h-3.5" /> Add {layer.label.toLowerCase()}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
