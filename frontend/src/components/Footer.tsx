"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";

const footerLinks = {
  Product: [
    { label: "Features",    href: "/#features" },
    { label: "How It Works",href: "/#workflow" },
    { label: "Pricing",     href: "/#pricing" },
    { label: "Changelog",   href: "/changelog" },
  ],
  Company: [
    { label: "About",    href: "/about" },
    { label: "Blog",     href: "/blog" },
    { label: "Careers",  href: "/careers" },
    { label: "Contact",  href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service",href: "/terms" },
    { label: "Cookie Policy",   href: "/cookies" },
  ],
};

const socials = [
  { Icon: Github,   href: "https://github.com",    label: "GitHub"   },
  { Icon: Twitter,  href: "https://twitter.com",   label: "Twitter"  },
  { Icon: Linkedin, href: "https://linkedin.com",  label: "LinkedIn" },
  { Icon: Mail,     href: "mailto:hello@lumora.ai", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#080814]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-14">
          {/* Brand column */}
          <FadeInSection direction="up" delay={0} className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
              <span className="font-bold text-lg">
                <span className="gradient-text">Lumora</span>
                <span className="text-slate-300"> AI</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              The next-generation AI platform for creative professionals.
              Powered by IBM Granite â€” built for the future of creation.
            </p>

            {/* Newsletter stub */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary px-4 py-2 text-sm rounded-xl"
              >
                Subscribe
              </motion.button>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 mt-5">
              {socials.map(({ Icon, href, label }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </FadeInSection>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links], colIdx) => (
            <FadeInSection key={group} direction="up" delay={0.1 + colIdx * 0.06}>
              <h4 className="text-white font-semibold text-sm mb-5 tracking-wide">{group}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="group flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {l.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </FadeInSection>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-slate-500 text-sm"
          >
            &copy; {new Date().getFullYear()} Lumora AI. All rights reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 text-slate-600 text-xs"
          >
            <span>
              Powered by{" "}
              <span className="gradient-text font-semibold">IBM Granite</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
