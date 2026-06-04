"use client";

import { Search, X } from "lucide-react";

interface Props {
  deger: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AramaKutusu({ deger, onChange, placeholder = "Ara…", className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        value={deger}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
      {deger && (
        <button onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
