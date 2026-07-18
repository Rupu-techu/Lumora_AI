"use client";

import { useState } from "react";
import { Search, Download, Trash2, Filter, ImageIcon, X } from "lucide-react";

type GalleryImage = {
  id: string;
  src: string;
  prompt: string;
  createdAt: string;
};

const images: GalleryImage[] = [];
const filters = ["All", "Today", "This week", "This month"];

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const selectedImage = images.find((img) => img.id === selected);

  const filtered = images.filter((img) => img.prompt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Gallery</h1>
        <p className="text-slate-400 text-sm">
          {images.length} images in your collection
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by prompt..."
            className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeFilter === filter
                  ? "text-white border-purple-500/50"
                  : "text-slate-400 border-white/5 hover:border-white/15"
              }`}
              style={activeFilter === filter ? { background: "rgba(124,58,237,0.15)" } : undefined}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelected(img.id)}
            className="glass-card rounded-xl overflow-hidden cursor-pointer group hover:border-purple-500/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.prompt}
              className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="p-3">
              <p className="text-slate-300 text-xs line-clamp-2">{img.prompt}</p>
              <p className="text-slate-600 text-xs mt-1">{img.createdAt}</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No gallery items yet</p>
            <p className="text-slate-600 text-sm mt-2">
              The backend does not currently expose a gallery endpoint or image storage feed.
            </p>
          </div>
        )}
      </div>

      {selected && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card rounded-2xl overflow-hidden max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage.src}
              alt={selectedImage.prompt}
              className="w-full object-cover rounded-t-2xl"
            />
            <div className="p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-white text-sm font-medium mb-1">Prompt</p>
                <p className="text-slate-400 text-sm">{selectedImage.prompt}</p>
                <p className="text-slate-600 text-xs mt-2">{selectedImage.createdAt}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={selectedImage.src}
                  download="lumora-image.jpg"
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
