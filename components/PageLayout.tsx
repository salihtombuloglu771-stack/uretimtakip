"use client";

import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  baslik: string;
  altyazi?: string;
  sagIcerik?: ReactNode;
  yenile?: () => void;
  yukleniyor?: boolean;
}

export default function PageLayout({ children, baslik, altyazi, sagIcerik, yenile, yukleniyor }: Props) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#f4f6fb" }}>
        <Sidebar />
        <main className="flex-1 md:ml-60 min-w-0">
          {/* Sayfa başlığı */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-slate-800 text-lg font-bold leading-tight">{baslik}</h1>
                {altyazi && <p className="text-slate-400 text-xs mt-0.5">{altyazi}</p>}
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
          <div className="p-6 space-y-5">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
