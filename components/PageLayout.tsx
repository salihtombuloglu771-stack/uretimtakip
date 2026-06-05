"use client";

import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import {
  RefreshCw, ArrowLeft,
  Package, Cpu, Wrench, ShieldCheck, BarChart2,
  ClipboardList, Layers, Zap, Factory, Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  baslik: string;
  altyazi?: string;
  sagIcerik?: ReactNode;
  yenile?: () => void;
  yukleniyor?: boolean;
}

const KONVEYOR = [
  Package, Cpu, Wrench, ShieldCheck, BarChart2,
  ClipboardList, Layers, Zap, Factory, Timer,
];

export default function PageLayout({ children, baslik, altyazi, sagIcerik, yenile, yukleniyor }: Props) {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#f4f6fb" }}>
        <Sidebar />
        <main className="flex-1 md:ml-60 min-w-0">
          {/* Sayfa başlığı */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 py-4 relative overflow-hidden">
            {/* Konveyör bant animasyonu */}
            <div className="header-conveyor absolute inset-0 flex items-center gap-9 pointer-events-none opacity-[0.32] select-none">
              {[...KONVEYOR, ...KONVEYOR, ...KONVEYOR, ...KONVEYOR].map((Ikon, i) => (
                <Ikon key={i} size={20} className="text-blue-600 flex-shrink-0" />
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => router.back()}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium shadow-sm">
                  <ArrowLeft size={15} />
                  <span>Geri</span>
                </button>
                <div className="min-w-0">
                  <h1 className="text-slate-800 text-lg font-bold leading-tight truncate">{baslik}</h1>
                  {altyazi && <p className="text-slate-400 text-xs mt-0.5">{altyazi}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {sagIcerik}
                {yenile && (
                  <button onClick={yenile}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 text-sm px-3 py-2 rounded-xl hover:bg-blue-50 transition-all">
                    <RefreshCw size={14} className={yukleniyor ? "animate-spin" : ""} />
                    <span className="hidden sm:inline text-xs font-medium">Yenile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* İçerik */}
          <div className="p-6 space-y-5 animate-page-enter">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
