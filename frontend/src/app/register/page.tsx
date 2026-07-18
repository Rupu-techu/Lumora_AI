"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import Input from "@/components/Input";
import { authApi } from "@/lib/api";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await authApi.register(form.name, form.email, form.password);
      localStorage.setItem("lumora_token", response.data.access_token);
      localStorage.setItem("lumora_refresh_token", response.data.refresh_token);
      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#2563eb,transparent)" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">
              <span className="gradient-text">Lumora</span>
              <span className="text-slate-300"> AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start generating for free — no credit card needed</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={errors.name}
              icon={<User className="w-4 h-4" />}
              autoComplete="name"
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            {/* Password strength */}
            {form.password && (
              <div className="flex flex-col gap-1.5">
                {passwordRules.map((r) => (
                  <div key={r.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${r.test(form.password) ? "bg-green-500" : "bg-white/10"}`}>
                      {r.test(form.password) && <Check className="w-2 h-2 text-white" />}
                    </div>
                    <span className={r.test(form.password) ? "text-green-400" : "text-slate-500"}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              error={errors.confirm}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            {apiError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-400">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-slate-400">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
