"use client";

import { useState } from "react";
import { User, Bell, Key, Palette, Save, Check } from "lucide-react";
import Input from "@/components/Input";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api", label: "API Keys", icon: Key },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    email: "jane@example.com",
    bio: "Creative director & AI enthusiast.",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your account and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === id
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
            style={activeTab === id ? { background: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(37,99,235,0.4))" } : undefined}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                J
              </div>
              <div>
                <button type="button" className="btn-secondary text-xs px-4 py-2">
                  Change avatar
                </button>
                <p className="text-slate-500 text-xs mt-1">JPG, PNG or GIF up to 2MB</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="Email address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-brand-dark/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="btn-primary px-6">
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          {[
            { label: "Generation complete", desc: "Notify when an AI generation finishes", default: true },
            { label: "Project updates", desc: "Collaborator activity in your projects", default: true },
            { label: "Weekly digest", desc: "Summary of your usage and new features", default: false },
            { label: "Marketing emails", desc: "Product announcements and promotions", default: false },
          ].map((item) => {
            const [checked, setChecked] = useState(item.default);
            return (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setChecked(!checked)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 relative ${checked ? "" : "bg-white/10"}`}
                  style={checked ? { background: "linear-gradient(135deg,#7c3aed,#2563eb)" } : undefined}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                      checked ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* API Keys tab */}
      {activeTab === "api" && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">API Keys</h3>
            <button className="btn-primary text-xs px-4 py-2">
              <Key className="w-3.5 h-3.5" />
              Generate key
            </button>
          </div>
          <div className="rounded-xl bg-brand-dark/60 border border-white/5 divide-y divide-white/5">
            {[
              { name: "Production key", last: "••••••••••••4a2f", created: "Dec 12, 2024", status: "active" },
              { name: "Development key", last: "••••••••••••8b7c", created: "Nov 3, 2024", status: "active" },
            ].map((key) => (
              <div key={key.name} className="flex items-center justify-between px-4 py-3 gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{key.name}</p>
                  <p className="text-slate-500 text-xs font-mono mt-0.5">{key.last}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">{key.created}</p>
                  <span className="text-green-400 text-xs">{key.status}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs">
            API keys are used to authenticate requests. Keep them secret and rotate regularly.
          </p>
        </div>
      )}

      {/* Appearance tab */}
      {activeTab === "appearance" && (
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-4">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {["Dark", "Light", "System"].map((t) => (
                <button
                  key={t}
                  className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                    t === "Dark"
                      ? "text-white border-purple-500/50"
                      : "text-slate-400 border-white/5 hover:border-white/15"
                  }`}
                  style={t === "Dark" ? { background: "rgba(124,58,237,0.15)" } : undefined}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Accent colour</h3>
            <div className="flex gap-3">
              {["#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626"].map((c) => (
                <button
                  key={c}
                  className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-brand-dark transition-all"
                  style={{
                    background: c,
                    outline: c === "#7c3aed" ? `2px solid ${c}` : "2px solid transparent",
                    outlineOffset: "2px",
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
