"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features",   href: "/#features"  },
  { label: "How it works", href: "/#workflow" },
  { label: "Pricing",    href: "/#pricing"   },
];

export default function Navbar() {
  const [open,    setOpen]    = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-[#09090f]/80 backdrop-blur-xl"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-[60px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Wordmark — small gradient square + name */}
            <div
              className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4f46e5, #3730a3)" }}
            >
              {/* Simple geometric mark */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="font-semibold text-[0.95rem] tracking-tight text-white/90 group-hover:text-white transition-colors duration-200">
              Lumora
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
              >
                <Link
                  href={l.href}
                  className="px-4 py-2 text-[0.83rem] text-slate-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.045]"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* ── CTA ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="hidden md:flex items-center gap-3"
          >
            <Link
              href="/login"
              className="text-[0.83rem] text-slate-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-primary text-[0.83rem] px-4 py-2 rounded-lg"
            >
              Get started
            </Link>
          </motion.div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open
                ? <motion.span key="x"    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}><X    className="w-5 h-5" /></motion.span>
                : <motion.span key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-white/[0.06] bg-[#09090f]/95 backdrop-blur-2xl"
          >
            <nav className="flex flex-col px-5 py-5 gap-0.5">
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-slate-400 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-white/[0.06]">
                <Link href="/login"    onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/[0.04] transition-colors">Sign in</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary text-sm justify-center text-center">Get started</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
