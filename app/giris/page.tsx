"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory, Eye, EyeOff, LogIn } from "lucide-react";
import type { KullaniciRol } from "@/data/types";

const OTURUM_ANAHTARI = "uretim_oturum";
const ROL_ANAHTARI    = "uretim_rol";

// Kullanıcı hesapları — ilerleyen sürümde API'ye taşınabilir
const HESAPLAR: { kullanici: string; sifre: string; rol: KullaniciRol }[] = [
  { kullanici: "admin",    sifre: "1234", rol: "admin"    },
  { kullanici: "operatör", sifre: "1234", rol: "operatör" },
];

export default function GirisPage() {
  const router = useRouter();
  const [kullanici,   setKullanici]   = useState("");
  const [sifre,       setSifre]       = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);
  const [hata,        setHata]        = useState("");
  const [yukleniyor,  setYukleniyor]  = useState(false);

  function handleGiris(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setHata("");

    setTimeout(() => {
      const hesap = HESAPLAR.find(
        (h) => h.kullanici === kullanici.trim() && h.sifre === sifre
      );
      if (hesap) {
        localStorage.setItem(OTURUM_ANAHTARI, "aktif");
        localStorage.setItem(ROL_ANAHTARI, hesap.rol);
        router.replace("/");
      } else {
        setHata("Kullanıcı adı veya şifre hatalı.");
        setYukleniyor(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Factory size={28} className="text-white" />
          </div>
          <h1 className="text-slate-800 text-2xl font-bold">ÜretimTakip</h1>
          <p className="text-slate-500 text-sm mt-1">ERP Portal — Giriş Yap</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleGiris} className="space-y-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Kullanıcı Adı</label>
              <input
                type="text"
                value={kullanici}
                onChange={(e) => setKullanici(e.target.value)}
                placeholder="admin veya operatör"
                autoComplete="username"
                className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Şifre</label>
              <div className="relative">
                <input
                  type={sifreGoster ? "text" : "password"}
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
                <button type="button" onClick={() => setSifreGoster(!sifreGoster)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {hata && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>
            )}

            <button type="submit" disabled={yukleniyor} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition-colors text-sm">
              {yukleniyor
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><LogIn size={16} /> Giriş Yap</>
              }
            </button>
          </form>

          {/* Hesap ipuçları */}
          <div className="mt-6 space-y-1.5">
            <p className="text-slate-400 text-xs text-center font-medium">Test Hesapları</p>
            <div className="grid grid-cols-2 gap-2">
              {HESAPLAR.map((h) => (
                <button
                  key={h.kullanici}
                  type="button"
                  onClick={() => { setKullanici(h.kullanici); setSifre(h.sifre); }}
                  className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors text-left"
                >
                  <span className="font-medium text-slate-700">{h.kullanici}</span>
                  <span className="block text-slate-400">{h.rol === "admin" ? "Tam yetki" : "Kayıt ekleyebilir"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
