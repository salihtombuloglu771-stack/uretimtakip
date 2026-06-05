"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  ikon: LucideIcon;
  baslik: string;
  aciklama?: string;
  buton?: { label: string; href?: string; onClick?: () => void };
  kucuk?: boolean;
}

export default function EmptyState({ ikon: Ikon, baslik, aciklama, buton, kucuk = false }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${kucuk ? "py-10" : "py-16"}`}>
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Ikon size={kucuk ? 20 : 24} className="text-slate-400" />
      </div>
      <p className="text-slate-700 font-semibold text-sm mb-1">{baslik}</p>
      {aciklama && <p className="text-slate-400 text-xs max-w-xs leading-relaxed">{aciklama}</p>}
      {buton && (
        <div className="mt-4">
          {buton.href ? (
            <Link href={buton.href}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
              {buton.label}
            </Link>
          ) : (
            <button onClick={buton.onClick}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
              {buton.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
