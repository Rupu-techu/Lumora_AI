"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Input from "@/components/Input";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await authApi.login(form.email, form.password);
      localStorage.setItem("lumora_token", response.data.access_token);
      localStorage.setItem("lumora_refresh_token", response.data.refresh_token);
      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-transparent" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>

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
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-400">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-slate-400">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
