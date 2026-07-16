"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Minimal ambient background — three very soft light sources
 * and a faint grid. No particles, no pulsing.
 * Everything is fixed so it doesn't repaint on scroll.
 */
export default function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* ── Base gradient ─────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(79,70,229,0.09) 0%, transparent 70%), #09090f",
        }}
      />

      {/* ── Ambient light 1 — top-left cool violet ────────────── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 800,
          height: 800,
          top: "-20%",
          left: "-15%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(99,91,255,0.055), transparent 65%)",
          filter: "blur(80px)",
        }}
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Ambient light 2 — top-right deep blue ─────────────── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 700,
          height: 700,
          top: "-10%",
          right: "-12%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.05), transparent 65%)",
          filter: "blur(90px)",
        }}
        animate={{ y: [0, 22, 0], x: [0, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* ── Ambient light 3 — bottom center very dim indigo ───── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 900,
          height: 600,
          bottom: "5%",
          left: "25%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(79,70,229,0.04), transparent 65%)",
          filter: "blur(100px)",
        }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />

      {/* ── Grid ────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 30%, black 20%, transparent 80%)",
        }}
      />
    </div>
  );
}
