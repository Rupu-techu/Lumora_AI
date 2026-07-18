"use client";

import { useState } from "react";
import { Wand2, Loader2, Sparkles, Copy, Download, RefreshCw, Settings2 } from "lucide-react";
import { graniteApi } from "@/lib/api";

const models = [
  { id: "granite-13b", label: "Granite 13B" },
  { id: "granite-20b", label: "Granite 20B Code" },
  { id: "granite-vision", label: "Granite Vision" },
];

const stylePresets = [
  "Photorealistic", "Digital Art", "Oil Painting",
  "Watercolor", "Sketch", "Cyberpunk", "Minimalist",
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("granite-vision");
  const [style, setStyle] = useState("Photorealistic");
  const [steps, setSteps] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const response = await graniteApi.imagine(prompt.trim());
      const imageUrl = response.data.image_url as string | null;
      if (!imageUrl) {
        throw new Error("The backend did not return an image URL.");
      }
      setResult(imageUrl);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Image generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">AI Studio</h1>
        <p className="text-slate-400 text-sm">
          Describe your vision and let IBM Granite bring it to life.
        </p>
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-sm text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleGenerate} className="glass-card rounded-2xl p-5 space-y-4">
            {/* Prompt */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city skyline at dusk, neon lights reflecting on wet streets, cinematic photography..."
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-brand-dark/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Model selector */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Model</label>
              <div className="flex flex-col gap-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all border ${
                      model === m.id
                        ? "text-white border-purple-500/60"
                        : "text-slate-400 border-white/5 hover:border-white/10"
                    }`}
                    style={model === m.id ? { background: "rgba(124,58,237,0.15)" } : undefined}
                  >
                    <span>{m.label}</span>
                    {model === m.id && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced settings toggle */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              Advanced settings
            </button>

            {showSettings && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                {/* Style */}
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Style</label>
                  <div className="flex flex-wrap gap-2">
                    {stylePresets.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStyle(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                          style === s
                            ? "text-white border-purple-500/60 bg-purple-500/15"
                            : "text-slate-400 border-white/5 hover:border-white/15"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Steps</label>
                    <span className="text-sm text-purple-400 font-mono">{steps}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>Fast</span>
                    <span>Quality</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-2xl overflow-hidden h-full min-h-[420px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">IBM Granite is working…</p>
                  <p className="text-slate-500 text-sm">This usually takes 2–5 seconds</p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : result ? (
              <div className="flex-1 flex flex-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result}
                  alt="Generated image"
                  className="w-full object-cover flex-1 rounded-t-2xl"
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <p className="text-slate-400 text-xs truncate max-w-xs">
                    {prompt.slice(0, 60)}…
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      title="Copy prompt">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      title="Regenerate">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <a
                      href={result}
                      download="lumora-generation.jpg"
                      className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
                <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center border border-white/10">
                  <Wand2 className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-slate-300 font-medium">Your generation will appear here</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  Write a detailed prompt on the left and click Generate to create your first image.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
