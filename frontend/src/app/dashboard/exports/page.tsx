"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";
import { Download, FileText, ImageIcon, Archive, Check, Clock, ArrowRight } from "lucide-react";

type ExportItem = {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "ZIP" | "PNG";
  size: string;
  project: string;
  date: string;
  status: "ready" | "processing" | "failed";
};

const exportsData: ExportItem[] = [];

const TYPE_STYLE: Record<string, { bg: string; text: string; icon: ElementType }> = {
  PDF: { bg: "bg-rose-500/12", text: "text-rose-400", icon: FileText },
  DOCX: { bg: "bg-blue-500/12", text: "text-blue-400", icon: FileText },
  TXT: { bg: "bg-slate-500/12", text: "text-slate-400", icon: FileText },
  ZIP: { bg: "bg-amber-500/12", text: "text-amber-400", icon: Archive },
  PNG: { bg: "bg-purple-500/12", text: "text-purple-400", icon: ImageIcon },
};

export default function ExportsPage() {
  const readyCount = exportsData.filter((item) => item.status === "ready").length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-3 text-sm text-slate-300">
            <Download className="w-3.5 h-3.5" /> Exports
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Your exports</h1>
          <p className="text-slate-400 text-sm">{readyCount} files ready to download</p>
        </div>
        <button className="btn-primary text-sm px-5 py-2.5 rounded-2xl disabled:opacity-40" disabled>
          <Download className="w-4 h-4" /> New export
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total exports", value: exportsData.length, icon: Archive },
          { label: "Ready", value: readyCount, icon: Check },
          { label: "Processing", value: exportsData.filter((item) => item.status === "processing").length, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-white mb-0.5">{value}</div>
            <div className="text-slate-400 text-xs">{label}</div>
          </div>
        ))}
      </motion.div>

      {exportsData.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Archive className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium mb-1">No exports yet</p>
          <p className="text-slate-600 text-sm">
            The backend does not currently expose an exports endpoint, so export jobs remain unavailable.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
          {exportsData.map((item, i) => {
            const ts = TYPE_STYLE[item.type];
            const StatusIcon = item.status === "ready" ? Check : item.status === "processing" ? Clock : ArrowRight;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ts.bg}`}>
                  <ts.icon className={`w-5 h-5 ${ts.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs font-bold ${ts.text}`}>{item.type}</span>
                    <span className="text-xs text-slate-500">{item.project}</span>
                    {item.size !== "—" && <span className="text-xs text-slate-600">{item.size}</span>}
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.status === "ready"
                        ? "bg-emerald-500/12 text-emerald-400"
                        : item.status === "processing"
                          ? "bg-amber-500/12 text-amber-400"
                          : "bg-red-500/12 text-red-400"
                    }`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {item.status}
                  </span>
                  <span className="text-slate-600 text-xs">{item.date}</span>
                </div>

                {item.status === "ready" && (
                  <button className="p-2 text-slate-500 hover:text-white hover:bg-white/8 rounded-xl transition-colors flex-shrink-0" disabled>
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
