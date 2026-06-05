"use client";

import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";
import { ReactNode, useState, useEffect } from "react";
import {
  RefreshCw, ArrowLeft, Bell, FilePlus,
  Package, Cpu, Wrench, ShieldCheck, BarChart2,
  ClipboardList, Layers, Zap, Factory, Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOkunmamisMesajSayisi } from "@/lib/db";

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
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [bildirimSayisi, setBildirimSayisi] = useState(0);

  useEffect(() => {
    const ad = localStorage.getItem("uretim_kullanici_adi") ?? "";
    setKullaniciAdi(ad);
    if (ad) {
      getOkunmamisMesajSayisi(ad).then(setBildirimSayisi).catch(() => {});
    }
  }, []);

  const initial = kullaniciAdi ? kullaniciAdi.charAt(0).toUpperCase() : "";

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#f4f6fb" }}>
        <Sidebar />
        <main className="flex-1 md:ml-60 min-w-0">

          {/* ── Sayfa başlığı ── */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 py-3.5 relative overflow-hidden">

            {/* Konveyör bant animasyonu */}
            <div className="header-conveyor absolute inset-0 flex items-center gap-9 pointer-events-none opacity-[0.32] select-none">
              {[...KONVEYOR, ...KONVEYOR, ...KONVEYOR, ...KONVEYOR].map((Ikon, i) => (
                <Ikon key={i} size={20} className="text-slate-900 flex-shrink-0" />
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 relative z-10">

              {/* Sol: geri + başlık */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => router.back()}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium shadow-sm">
                  <ArrowLeft size={15} />
                  <span className="hidden sm:inline">Geri</span>
                </button>
                <div className="min-w-0">
                  <h1 className="text-slate-800 text-lg font-bold leading-tight truncate">{baslik}</h1>
                  {altyazi && <p className="text-slate-400 text-xs mt-0.5">{altyazi}</p>}
                </div>
              </div>

              {/* Sağ: aksiyonlar + kullanıcı */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {sagIcerik}

                {/* Yeni İş Emri kısayolu */}
                <Link href="/uretim-emri"
                  className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm">
                  <FilePlus size={14} /> Yeni İş Emri
                </Link>

                {/* Bildirim zili */}
                <Link href="/mesajlar" className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <Bell size={18} className="text-slate-500" />
                  {bildirimSayisi > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {bildirimSayisi > 9 ? "9+" : bildirimSayisi}
                    </span>
                  )}
                </Link>

                {/* Yenile */}
                {yenile && (
                  <button onClick={yenile}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all">
                    <RefreshCw size={14} className={yukleniyor ? "animate-spin" : ""} />
                    <span className="hidden sm:inline text-xs font-medium">Yenile</span>
                  </button>
                )}

                {/* Kullanıcı avatarı */}
                {initial && (
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white text-xs font-black">{initial}</span>
                    </div>
                    <span className="hidden md:block text-slate-700 text-sm font-semibold max-w-[100px] truncate">
                      {kullaniciAdi}
                    </span>
                  </div>
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
