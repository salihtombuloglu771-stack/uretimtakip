"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { loginKullanici } from "@/lib/db";
import type { KullaniciRol } from "@/data/types";

const OTURUM_ANAHTARI = "uretim_oturum";
const ROL_ANAHTARI    = "uretim_rol";

// Hardcoded fallback — Supabase kullanicilar tablosu yokken çalışır
const FALLBACK: { kullanici: string; sifre: string; rol: KullaniciRol }[] = [
  { kullanici: "admin",    sifre: "1234", rol: "admin"    },
  { kullanici: "operatör", sifre: "1234", rol: "operatör" },
];

const HATIRLA_ANAHTARI = "uretim_hatirla";

export default function GirisPage() {
  const router = useRouter();
  const [kullanici,   setKullanici]   = useState(() => {
    try { return JSON.parse((typeof window !== "undefined" ? localStorage : null)?.getItem(HATIRLA_ANAHTARI) ?? "{}").kullanici ?? ""; } catch { return ""; }
  });
  const [sifre,       setSifre]       = useState(() => {
    try { return JSON.parse((typeof window !== "undefined" ? localStorage : null)?.getItem(HATIRLA_ANAHTARI) ?? "{}").sifre ?? ""; } catch { return ""; }
  });
  const [beniHatirla, setBeniHatirla] = useState(() => typeof window !== "undefined" && !!localStorage.getItem(HATIRLA_ANAHTARI));
  const [sifreGoster, setSifreGoster] = useState(false);
  const [hata,        setHata]        = useState("");
  const [yukleniyor,  setYukleniyor]  = useState(false);

  async function handleGiris(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setHata("");

    // Önce Supabase'den kontrol et
    let hesap = await loginKullanici(kullanici.trim(), sifre);

    // Supabase'de bulunamazsa hardcoded fallback'e bak
    if (!hesap) {
      const fb = FALLBACK.find(h => h.kullanici === kullanici.trim() && h.sifre === sifre);
      if (fb) hesap = { rol: fb.rol };
    }

    if (hesap) {
      localStorage.setItem(OTURUM_ANAHTARI, "aktif");
      localStorage.setItem(ROL_ANAHTARI, hesap.rol);
      localStorage.setItem("uretim_kullanici_adi", kullanici.trim());
      if (beniHatirla) {
        localStorage.setItem(HATIRLA_ANAHTARI, JSON.stringify({ kullanici: kullanici.trim(), sifre }));
      } else {
        localStorage.removeItem(HATIRLA_ANAHTARI);
      }
      router.replace("/");
    } else {
      setHata("Kullanıcı adı veya şifre hatalı.");
      setYukleniyor(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="NexPlan" className="w-16 h-16 mb-4 drop-shadow-xl" />
          <h1 className="text-slate-800 text-2xl font-bold">NexPlan</h1>
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

            <div className="flex items-center gap-2">
              <input
                id="beniHatirla"
                type="checkbox"
                checked={beniHatirla}
                onChange={(e) => setBeniHatirla(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <label htmlFor="beniHatirla" className="text-slate-500 text-sm cursor-pointer select-none">
                Beni hatırla
              </label>
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

          <p className="mt-5 text-slate-400 text-xs text-center">
            Kullanıcı hesabınız yoksa admin ile iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
}
