"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Brain, Wand2, Zap, Shield, Layers, GitBranch,
  ArrowRight, Check, ChevronDown, MessageSquare,
  Cpu, ImageIcon, Globe, Lock, Star,
} from "lucide-react";

import Navbar          from "@/components/Navbar";
import Footer          from "@/components/Footer";
import FadeInSection   from "@/components/FadeInSection";
import AnimatedCounter from "@/components/AnimatedCounter";

const AmbientBackground = dynamic(
  () => import("@/components/AnimatedBackground"),
  { ssr: false }
);

/* ─────────────────────────── DATA ──────────────────────────────── */

const features = [
  {
    icon: Brain,
    title: "IBM Granite AI",
    description: "Enterprise foundation models for text, code, and creative generation — battle-tested and production-ready.",
    delay: 0,
  },
  {
    icon: Wand2,
    title: "Text-to-Image",
    description: "Translate natural language into polished visuals. Consistent style, every time.",
    delay: 0.06,
  },
  {
    icon: Zap,
    title: "Sub-second Inference",
    description: "GPU-accelerated pipelines deliver results before your next keystroke. No waiting.",
    delay: 0.12,
  },
  {
    icon: Layers,
    title: "Multi-Modal",
    description: "Text, images, and code in one unified workspace. No context-switching required.",
    delay: 0.18,
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II. End-to-end encryption, audit logs, and fine-grained access controls.",
    delay: 0.24,
  },
  {
    icon: GitBranch,
    title: "Full Version History",
    description: "Every generation is tracked. Compare, revert, and branch your work with complete lineage.",
    delay: 0.30,
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Describe your vision",
    description: "Write a natural language prompt — a scene, a product, a concept. The more detail, the sharper the result.",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "Granite processes your request",
    description: "IBM Granite routes your prompt through the optimal foundation model — text, vision, or code.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Review and refine",
    description: "Browse results in the gallery, adjust parameters, and regenerate with one click until it's exactly right.",
    icon: ImageIcon,
  },
  {
    step: "04",
    title: "Export and deploy",
    description: "Download assets, share via link, or push directly to your pipeline through the Imaginex REST API.",
    icon: Globe,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Creative Director, Verb Agency",
    avatar: "SC",
    quote: "Imaginex AI cut our concept-to-asset time by 80%. What used to take days now takes minutes — and the quality is consistently stunning.",
  },
  {
    name: "Marcus Osei",
    role: "Lead Engineer, Novu",
    avatar: "MO",
    quote: "The IBM Granite integration is seamlessly powerful. Clean API, minimal latency, and enterprise compliance that just works out of the box.",
  },
  {
    name: "Lena Vogt",
    role: "Founder, Stillwater Studio",
    avatar: "LV",
    quote: "I replaced three separate tools with Imaginex. The multi-modal workspace is a game-changer — like having a whole creative department.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "For exploring what's possible",
    cta: "Get started free",
    href: "/register",
    features: ["100 generations / month", "3 active projects", "Standard resolution", "Community support", "Public gallery"],
    highlight: false,
  },
  {
    name: "Pro",
    price: 29,
    period: "/ month",
    description: "For professionals who create daily",
    cta: "Start free trial",
    href: "/register?plan=pro",
    features: ["Unlimited generations", "Unlimited projects", "4K resolution output", "Priority queue", "API access (10K calls)", "Private gallery", "IBM Granite models"],
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: 99,
    period: "/ month",
    description: "For teams and organisations",
    cta: "Contact sales",
    href: "/contact",
    features: ["Everything in Pro", "Custom model fine-tuning", "SSO / SAML", "SLA 99.99% uptime", "Dedicated support", "Custom contracts", "On-premise option"],
    highlight: false,
  },
];

const stats = [
  { value: 10,  suffix: "M+",  label: "Generations",     prefix: "" },
  { value: 50,  suffix: "K+",  label: "Active creators", prefix: "" },
  { value: 99,  suffix: ".9%", label: "Uptime",           prefix: "" },
  { value: 1,   suffix: "s",   label: "Avg latency",      prefix: "<" },
];

const tickerItems = [
  "IBM Granite",  "Text-to-Image",  "Code Generation",  "Multi-Modal AI",
  "Sub-second latency",  "Enterprise ready",  "Version history",  "REST API",
  "SOC 2 certified",  "Unlimited scale",
];

/* ─────────────────────────── PAGE ──────────────────────────────── */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  /* Very gentle parallax — text drifts up slightly */
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[#09090f] text-slate-100 overflow-x-hidden">
      <AmbientBackground />
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Subtle ambient spotlight behind hero text — barely perceptible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 42%, rgba(79,70,229,0.07) 0%, transparent 70%)",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 text-center"
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="pill-badge mx-auto mb-10 w-fit"
          >
            {/* Live indicator */}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            Powered by IBM Granite Foundation Models
          </motion.div>

          {/* Headline — clean white, single lavender accent word */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.85rem] sm:text-6xl lg:text-[5.25rem] font-extrabold tracking-tight leading-[1.03] mb-7"
          >
            <span className="text-white">Create</span>
            {" "}
            <span className="accent-text">without</span>
            {" "}
            <span className="text-white">limits.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-xl mx-auto mb-11 leading-relaxed font-light"
          >
            Imaginex AI pairs IBM&apos;s most capable Granite models with a
            workspace built for professionals — go from prompt to production in seconds.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/register" className="btn-primary text-sm px-7 py-3 rounded-xl">
              Start creating — it&apos;s free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/#features" className="btn-secondary text-sm px-7 py-3 rounded-xl">
              See the features
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.82, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10 text-xs text-slate-500"
          >
            <span className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-slate-400 text-slate-400" />
                ))}
              </div>
              Trusted by 50,000+ creators
            </span>
            <span className="hidden sm:block w-px h-3 bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              SOC 2 Type II certified
            </span>
            <span className="hidden sm:block w-px h-3 bg-slate-700" />
            <span>No credit card required</span>
          </motion.div>
        </motion.div>

        {/* ── Hero browser mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0,  rotateX: 8  }}
          transition={{ delay: 0.85, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="animate-drift relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 mt-16"
          style={{ perspective: "1400px", transformStyle: "preserve-3d", transformOrigin: "50% 100%" }}
        >
          {/* Browser window — subtle shadow, no neon border */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            {/* Chrome bar */}
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#111120] border-b border-white/[0.06]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              <div className="flex-1 mx-3">
                <div className="bg-white/[0.04] rounded-md h-5 max-w-xs mx-auto flex items-center justify-center">
                  <span className="text-slate-600 text-[10px] font-mono tracking-wide">
                    app.imaginex.ai/dashboard
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="bg-[#0d0d1e] p-3.5 grid grid-cols-3 gap-2.5 min-h-[160px] sm:min-h-[220px]">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col gap-1.5">
                {["Dashboard", "Projects", "Generate", "Gallery", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: i === 0 ? "rgba(79,70,229,0.12)" : "transparent",
                      border: i === 0 ? "1px solid rgba(79,70,229,0.18)" : "1px solid transparent",
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded"
                      style={{
                        background: i === 0 ? "rgba(99,91,255,0.6)" : "rgba(255,255,255,0.08)",
                      }}
                    />
                    <div
                      className="h-1.5 rounded flex-1"
                      style={{ background: i === 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)" }}
                    />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="col-span-3 sm:col-span-2 space-y-2.5">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-1.5">
                  {["10M+", "50K+", "99.9%", "<1s"].map((v, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-2 text-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="text-white/70 font-bold text-[11px]">{v}</div>
                      <div className="h-1 rounded bg-white/[0.06] mt-1 mx-1" />
                    </div>
                  ))}
                </div>
                {/* Image grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg overflow-hidden aspect-video"
                      style={{
                        background: `linear-gradient(135deg,
                          hsl(${240 + i * 18},40%,14%),
                          hsl(${220 + i * 14},50%,10%))`,
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Very faint glow beneath mockup — like a natural drop shadow with colour */}
          <div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/5 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, rgba(79,70,229,0.12), rgba(55,48,163,0.08))",
              filter: "blur(32px)",
            }}
          />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-slate-600"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          TICKER
      ══════════════════════════════════════ */}
      <div className="relative z-10 py-4 border-y border-white/[0.04] bg-[#09090f]/70 backdrop-blur-sm overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-3 mx-8 text-slate-600 text-xs font-medium whitespace-nowrap tracking-wide uppercase"
              >
                <span className="w-1 h-1 rounded-full bg-indigo-700/60 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <FadeInSection>
            <div
              className="rounded-2xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8"
              style={{
                background: "rgba(15,15,28,0.5)",
                border: "1px solid rgba(255,255,255,0.065)",
              }}
            >
              {stats.map(({ value, suffix, label, prefix }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white mb-1.5 tracking-tight">
                    <AnimatedCounter to={value} prefix={prefix} suffix={suffix} />
                  </div>
                  <div className="text-slate-500 text-xs tracking-wide">{label}</div>
                </motion.div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeInSection className="text-center mb-16">
            <div className="pill-badge mx-auto mb-5 w-fit">Features</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
              Everything you need to{" "}
              <span className="accent-text">create</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-light">
              A complete suite of AI-powered tools for professionals who demand
              speed, quality, and control.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {features.map((f) => (
              <FadeInSection key={f.title} delay={f.delay} direction="up">
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="group relative rounded-xl p-6 h-full cursor-default"
                  style={{
                    background: "rgba(15,15,26,0.55)",
                    border: "1px solid rgba(255,255,255,0.065)",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  {/* Hover: lighten border only */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ border: "1px solid rgba(124,58,237,0.18)" }}
                  />

                  {/* Icon */}
                  <div className="feature-icon-wrap mb-5">
                    <f.icon className="w-4 h-4 text-slate-300" />
                  </div>

                  <h3 className="text-white font-semibold text-[0.95rem] mb-2.5 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      {/* ══════════════════════════════════════
          WORKFLOW
      ══════════════════════════════════════ */}
      <section id="workflow" className="relative z-10 py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">

            {/* Left column: heading */}
            <FadeInSection direction="left" className="lg:sticky lg:top-24">
              <div className="pill-badge mb-6 w-fit">How it works</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
                From prompt to{" "}
                <span className="accent-text">production</span>
                {" "}in four steps
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8 font-light max-w-sm">
                A streamlined workflow that eliminates friction between
                imagination and the final output.
              </p>
              <Link href="/register" className="btn-primary text-sm px-6 py-2.5 rounded-xl w-fit">
                Try it now <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeInSection>

            {/* Right column: steps */}
            <div className="relative">
              {/* Connecting line */}
              <motion.div
                className="absolute left-[18px] top-8 w-px"
                style={{ background: "linear-gradient(to bottom, rgba(79,70,229,0.35), transparent)" }}
                initial={{ height: 0 }}
                whileInView={{ height: "calc(100% - 64px)" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                viewport={{ once: true }}
              />

              <div className="space-y-8">
                {workflowSteps.map((step, i) => (
                  <FadeInSection key={step.step} delay={i * 0.12} direction="right">
                    <div className="flex gap-5">
                      {/* Step bubble */}
                      <div
                        className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          background: "rgba(79,70,229,0.12)",
                          border: "1px solid rgba(79,70,229,0.22)",
                        }}
                      >
                        <step.icon className="w-3.5 h-3.5 text-indigo-300" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <div className="text-[10px] font-mono text-slate-600 mb-1 tracking-widest">
                          {step.step}
                        </div>
                        <h3 className="text-white font-semibold text-[0.95rem] mb-1.5 tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section id="testimonials" className="relative z-10 py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeInSection className="text-center mb-14">
            <div className="pill-badge mx-auto mb-5 w-fit">Testimonials</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Loved by <span className="accent-text">creators</span>
            </h2>
            <p className="text-slate-400 text-base max-w-sm mx-auto font-light leading-relaxed">
              See what teams and individuals are building with Imaginex AI.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {testimonials.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.1} direction="up">
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="rounded-xl p-6 flex flex-col gap-5 h-full"
                  style={{
                    background: "rgba(15,15,26,0.55)",
                    border: "1px solid rgba(255,255,255,0.065)",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-amber-400/70 fill-amber-400/70" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-300 text-sm leading-relaxed flex-1 font-light">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                      style={{ background: "rgba(79,70,229,0.25)", border: "1px solid rgba(79,70,229,0.25)" }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeInSection className="text-center mb-14">
            <div className="pill-badge mx-auto mb-5 w-fit">Pricing</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Simple, transparent <span className="accent-text">pricing</span>
            </h2>
            <p className="text-slate-400 text-base max-w-sm mx-auto font-light leading-relaxed">
              Start free, scale when you need to. No hidden fees.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start">
            {pricingPlans.map((plan, i) => (
              <FadeInSection key={plan.name} delay={i * 0.08} direction="up">
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative rounded-xl p-7 flex flex-col gap-6"
                  style={
                    plan.highlight
                      ? {
                          background: "rgba(79,70,229,0.06)",
                          border: "1px solid rgba(79,70,229,0.22)",
                        }
                      : {
                          background: "rgba(15,15,26,0.55)",
                          border: "1px solid rgba(255,255,255,0.065)",
                        }
                  }
                >
                  {plan.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[11px] font-semibold text-indigo-200"
                      style={{
                        background: "rgba(79,70,229,0.18)",
                        border: "1px solid rgba(79,70,229,0.3)",
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="text-white font-semibold text-[0.95rem] mb-1 tracking-tight">{plan.name}</h3>
                    <p className="text-slate-500 text-xs">{plan.description}</p>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white tracking-tight">${plan.price}</span>
                    <span className="text-slate-500 mb-1 text-sm pb-0.5">{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-400">
                        <Check
                          className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                          style={{ color: plan.highlight ? "#818cf8" : "#4ade80" }}
                        />
                        <span className="font-light">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`${plan.highlight ? "btn-primary" : "btn-secondary"} w-full justify-center py-2.5 rounded-xl text-sm`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection className="text-center mt-8">
            <p className="text-slate-600 text-xs">
              All plans include a 14-day free trial. Cancel anytime.{" "}
              <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                Need more? Talk to us →
              </Link>
            </p>
          </FadeInSection>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-4xl" />

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <FadeInSection>
            <div
              className="relative rounded-2xl overflow-hidden text-center py-20 px-6 sm:px-16"
              style={{
                background: "rgba(15,15,28,0.6)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Very soft ambient glow inside the card */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)",
                }}
              />

              <div className="relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white mb-5 leading-tight tracking-tight"
                >
                  Ready to build something<br />
                  <span className="accent-text">extraordinary?</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="text-slate-400 text-base sm:text-lg mb-10 max-w-md mx-auto font-light leading-relaxed"
                >
                  Join 50,000+ creators already building with Imaginex AI.
                  Your first 100 generations are on us.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.22 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <Link href="/register" className="btn-primary text-sm px-8 py-3 rounded-xl">
                    Get started — it&apos;s free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/login" className="btn-secondary text-sm px-8 py-3 rounded-xl">
                    Sign in
                  </Link>
                </motion.div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
