"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, LayoutDashboard, FolderOpen, BookOpen,
  Users, Globe, Film, Wand2, Download, Settings,
  LogOut, ChevronRight, User, Zap, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ── Nav structure ─────────────────────────────────────── */
const navGroups = [
  {
    label: null,
    items: [
      { label: "Dashboard",  href: "/dashboard",                  icon: LayoutDashboard },
      { label: "Projects",   href: "/dashboard/projects",         icon: FolderOpen },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Story Generator",   href: "/dashboard/story-generator",   icon: BookOpen },
      { label: "Character Studio",  href: "/dashboard/character-studio",  icon: Users },
      { label: "World Builder",     href: "/dashboard/world-builder",     icon: Globe },
      { label: "Storyboard",        href: "/dashboard/storyboard",        icon: Film },
      { label: "Prompt Studio",     href: "/dashboard/prompt-studio",     icon: Wand2 },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Exports",   href: "/dashboard/exports",   icon: Download },
      { label: "Settings",  href: "/dashboard/settings",  icon: Settings },
    ],
  },
];

/* ── Sidebar item ──────────────────────────────────────── */
function NavItem({
  href, label, icon: Icon, active, collapsed,
}: {
  href: string; label: string; icon: React.ElementType;
  active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        collapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2.5",
        active
          ? "text-white"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
      style={active ? {
        background: "linear-gradient(135deg,rgba(124,58,237,0.22),rgba(37,99,235,0.22))",
        border: "1px solid rgba(124,58,237,0.28)",
      } : undefined}
    >
      {/* Active left bar */}
      {active && (
        <motion.span
          layoutId="active-pill"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-purple-400"
        />
      )}

      <Icon className={cn(
        "flex-shrink-0 transition-colors",
        collapsed ? "w-5 h-5" : "w-4 h-4",
        active ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"
      )} />

      {!collapsed && (
        <span className="truncate flex-1">{label}</span>
      )}

      {!collapsed && active && (
        <ChevronRight className="w-3 h-3 text-purple-400 flex-shrink-0" />
      )}

      {/* Collapsed tooltip */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2.5 z-50 whitespace-nowrap rounded-lg bg-[#1a1a38] border border-white/10 px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
          {label}
        </span>
      )}
    </Link>
  );
}

/* ── Main sidebar ─────────────────────────────────────── */
interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function DashboardSidebar({
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    if (typeof window !== "undefined") localStorage.removeItem("lumora_token");
    router.push("/login");
  }

  const sidebarContent = (isMobile = false) => (
    <div className={cn(
      "flex flex-col h-full",
      !isMobile && (collapsed ? "w-[68px]" : "w-64"),
      "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    )}>
      {/* ── Logo ── */}
      <div className={cn(
        "flex items-center border-b border-white/5 flex-shrink-0",
        collapsed && !isMobile ? "px-3 py-4 justify-center" : "px-5 py-4 gap-2.5"
      )}>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 320, damping: 14 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </motion.div>
        {(!collapsed || isMobile) && (
          <span className="font-bold text-[1.05rem] leading-none">
            <span className="gradient-text">Lumora</span>
            <span className="text-slate-400"> AI</span>
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5 scrollbar-hide">
        {navGroups.map(({ label, items }) => (
          <div key={label ?? "top"}>
            {/* Group label */}
            {label && (!collapsed || isMobile) && (
              <p className="px-3 mb-1.5 text-[10.5px] font-semibold tracking-widest text-slate-600 uppercase select-none">
                {label}
              </p>
            )}
            {collapsed && !isMobile && label && (
              <div className="mx-auto w-5 h-px bg-white/8 mb-2" />
            )}

            <div className="space-y-0.5">
              {items.map(({ label: itemLabel, href, icon }) => (
                <NavItem
                  key={href}
                  href={href}
                  label={itemLabel}
                  icon={icon}
                  active={pathname === href}
                  collapsed={collapsed && !isMobile}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Credits pill ── */}
      {(!collapsed || isMobile) && (
        <div className="mx-3 mb-3">
          <div className="rounded-xl p-3 text-xs"
            style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-purple-400" />
                Credits
              </span>
              <span className="text-purple-300 font-bold">84 / 100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full w-[84%]"
                style={{ background: "linear-gradient(90deg,#7c3aed,#2563eb)" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── User + logout ── */}
      <div className={cn(
        "border-t border-white/5 pt-3 pb-4 flex-shrink-0",
        collapsed && !isMobile ? "px-2 space-y-1" : "px-3 space-y-1"
      )}>
        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed && !isMobile ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/6 transition-all group",
            collapsed && !isMobile ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Sign out</span>}
        </button>

        {/* User */}
        <div className={cn(
          "flex items-center gap-3 glass-card rounded-xl",
          collapsed && !isMobile ? "px-2.5 py-2.5 justify-center" : "px-3 py-2.5"
        )}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
            JD
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">Jane Doe</p>
              <p className="text-[11px] text-slate-500 truncate">jane@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col min-h-screen bg-[#0c0c1e] border-r border-white/5 relative flex-shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {sidebarContent()}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-[#1e1e40] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 transition-all shadow-lg"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronsRight className="w-3 h-3" />
            : <ChevronsLeft  className="w-3 h-3" />
          }
        </button>
      </aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0c0c1e] border-r border-white/5 lg:hidden flex flex-col"
            >
              {sidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
