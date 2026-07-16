"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Sparkles, Copy, RefreshCw, Loader2, Star, Save } from "lucide-react";

const MODELS = ["Granite 13B", "Granite 20B Code", "Granite Vision"];
const CATEGORIES = ["Story", "Character", "World", "Dialogue", "Action", "Description"];

const SAVED_PROMPTS = [
  { label: "Hero's inner conflict",      cat: "Character", text: "Describe the internal struggle of a hero who must choose between duty and love..." },
  { label: "Mysterious landscape",       cat: "World",     text: "Describe a barren moonlit landscape that feels simultaneously beautiful and haunting..." },
  { label: "Tension-filled confrontation", cat: "Dialogue", text: "Write a tense dialogue between two old friends who now stand on opposing sides of a war..." },
];

export default function PromptStudioPage() {
  const [prompt, setPrompt]   = useState("");
  const [model,  setModel]    = useState("Granite 13B");
  const [cat,    setCat]      = useState("Story");
  const [loading, setLoading] = useState(false);
  const [output,  setOutput]  = useState<string | null>(null);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true); setOutput(null);
    await new Promise(r => setTimeout(r, 2200));
    setOutput(`The old fortress of Vorath stood at the precipice of the Ashfield Plains, its towers long since crumbled into fingers of black stone reaching toward a bruised sky. Aelindra had heard the stories — every child in Ironhaven had — of the thousand-year siege that ended not with triumph, but with silence. The kind of silence that swallows armies whole.\n\nShe dismounted, her breath misting in the cold, and studied the ruin. Somewhere beneath those fallen stones lay the Map of Severed Roads, and with it, the only route to ending the Pale Flame's stranglehold on the North.`);
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-amber-300">
          <Wand2 className="w-3.5 h-3.5" /> Prompt Studio
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Craft your prompt</h1>
        <p className="text-slate-400">Refine prompts and generate AI content powered by IBM Granite.</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Input panel */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">Category</label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${cat === c ? "text-white border-purple-500/50" : "text-slate-400 border-white/8 hover:border-white/15"}`}
                    style={cat === c ? { background: "rgba(124,58,237,0.18)" } : undefined}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Model</label>
              {MODELS.map(m => (
                <button key={m} onClick={() => setModel(m)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm mb-1 transition-all border ${model === m ? "text-white border-purple-500/40" : "text-slate-400 border-transparent hover:bg-white/4"}`}
                  style={model === m ? { background: "rgba(124,58,237,0.14)" } : undefined}>
                  {m} {model === m && <Sparkles className="w-3 h-3 text-purple-400" />}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Prompt</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
                placeholder="Describe a crumbling fortress at the edge of a barren plain, once home to a legendary siege..."
                className="w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all" />
            </div>

            <button onClick={generate} disabled={loading || !prompt.trim()}
              className="btn-primary w-full justify-center py-3 rounded-xl text-sm disabled:opacity-40">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate</>}
            </button>
          </div>

          {/* Saved prompts */}
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Saved prompts</p>
            {SAVED_PROMPTS.map(p => (
              <button key={p.label} onClick={() => setPrompt(p.text)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">{p.label}</span>
                  <span className="ml-auto text-[10px] text-purple-400 flex-shrink-0">{p.cat}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Output panel */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }} className="lg:col-span-3">
          <div className="glass-card rounded-2xl overflow-hidden h-full min-h-[440px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold mb-1">IBM Granite is writing…</p>
                  <p className="text-slate-500 text-sm">Usually 2–4 seconds</p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
            ) : output ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-xs text-slate-400 font-medium">Generated output · {model}</span>
                  <div className="flex gap-1.5">
                    <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={generate} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><Save className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex-1 p-5 overflow-y-auto">
                  <p className="text-slate-200 text-sm leading-7 whitespace-pre-wrap">{output}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
                <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center border border-white/10">
                  <Wand2 className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-slate-300 font-semibold">Output appears here</p>
                <p className="text-slate-500 text-sm max-w-xs">Enter a prompt and click Generate to see IBM Granite write your story.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
