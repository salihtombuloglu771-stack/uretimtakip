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
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <main className="flex-1 md:ml-60 min-w-0">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-slate-800 text-xl font-bold">{baslik}</h1>
                {altyazi && <p className="text-slate-500 text-sm mt-0.5">{altyazi}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {sagIcerik}
                {yenile && (
                  <button onClick={yenile}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-500 text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <RefreshCw size={14} className={yukleniyor ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Yenile</span>
                  </button>
                )}
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
