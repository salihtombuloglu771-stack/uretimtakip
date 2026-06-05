"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { apiGiris } from "@/lib/api";

const OTURUM_ANAHTARI  = "uretim_oturum";
const ROL_ANAHTARI     = "uretim_rol";
const TOKEN_ANAHTARI   = "uretim_token";
const HATIRLA_ANAHTARI = "uretim_hatirla";

export default function GirisPage() {
  const router = useRouter();

  const [kullanici, setKullanici] = useState(() => {
    try { return JSON.parse((typeof window !== "undefined" ? localStorage : null)?.getItem(HATIRLA_ANAHTARI) ?? "{}").kullanici ?? ""; } catch { return ""; }
  });
  const [sifre, setSifre] = useState(() => {
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
    try {
      const sonuc = await apiGiris(kullanici.trim(), sifre);
      localStorage.setItem(TOKEN_ANAHTARI,  sonuc.token);
      localStorage.setItem(OTURUM_ANAHTARI, "aktif");
      localStorage.setItem(ROL_ANAHTARI,    sonuc.rol);
      localStorage.setItem("uretim_kullanici_adi", sonuc.kullaniciAdi);
      if (beniHatirla) {
        localStorage.setItem(HATIRLA_ANAHTARI, JSON.stringify({ kullanici: kullanici.trim(), sifre }));
      } else {
        localStorage.removeItem(HATIRLA_ANAHTARI);
      }
      router.replace("/anasayfa");
    } catch (err: unknown) {
      const mesaj = err instanceof Error ? err.message : "";
      setHata(
        mesaj.includes("fetch") || mesaj.includes("network") || mesaj.includes("Failed")
          ? "Sunucuya bağlanılamadı."
          : "Kullanıcı adı veya şifre hatalı."
      );
      setYukleniyor(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>

      {/* Dekoratif arka plan topları */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)", animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />

        {/* Izgara deseni */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
      </div>

      {/* Kart */}
      <div className="relative w-full max-w-sm animate-fade-in-up">

        {/* Logo + Başlık */}
        <div className="flex flex-col items-center mb-8"
          style={{ animationDelay: "0ms" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/30 animate-float"
            style={{ background: "linear-gradient(135deg, #60a5fa, #1d4ed8)" }}>
            <img src="/logo.svg" alt="NexPlan" className="w-10 h-10" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">NexPlan</h1>
          <p className="text-blue-300/70 text-sm mt-1">ERP Portal — Giriş Yap</p>
        </div>

        {/* Form kartı — cam efekti */}
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10 animate-fade-in-up"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            animationDelay: "80ms",
          }}>

          <form onSubmit={handleGiris} className="space-y-5">

            <div className="flex flex-col gap-1.5 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <label className="text-blue-200/70 text-xs font-medium uppercase tracking-wider">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={kullanici}
                onChange={e => setKullanici(e.target.value)}
                placeholder="admin veya operatör"
                autoComplete="username"
                className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 border border-white/10 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 hover:border-white/25"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5 animate-fade-in-up" style={{ animationDelay: "220ms" }}>
              <label className="text-blue-200/70 text-xs font-medium uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={sifreGoster ? "text" : "password"}
                  value={sifre}
                  onChange={e => setSifre(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 border border-white/10 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 hover:border-white/25"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <button type="button" onClick={() => setSifreGoster(!sifreGoster)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                  {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 animate-fade-in-up" style={{ animationDelay: "290ms" }}>
              <input
                id="beniHatirla"
                type="checkbox"
                checked={beniHatirla}
                onChange={e => setBeniHatirla(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <label htmlFor="beniHatirla" className="text-white/50 text-sm cursor-pointer select-none hover:text-white/70 transition-colors">
                Beni hatırla
              </label>
            </div>

            {hata && (
              <div key={hata}
                className="animate-shake flex items-center gap-2 text-red-300 text-sm rounded-xl px-4 py-3 border border-red-400/20"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <span className="text-red-400">⚠</span> {hata}
              </div>
            )}

            <div className="animate-fade-in-up" style={{ animationDelay: "350ms" }}>
              <button type="submit" disabled={yukleniyor}
                className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm text-white disabled:opacity-50 shadow-lg shadow-blue-500/25"
                style={{
                  background: yukleniyor ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  transition: "transform 0.14s ease, box-shadow 0.18s ease, filter 0.14s ease",
                }}>
                {yukleniyor
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><LogIn size={16} /> Giriş Yap</>
                }
              </button>
            </div>
          </form>

          <p className="mt-6 text-white/25 text-xs text-center">
            Hesabınız yoksa sistem yöneticisiyle iletişime geçin.
          </p>
        </div>

        {/* Alt NexPlan yazısı */}
        <p className="text-center text-white/20 text-xs mt-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          © 2025 NexPlan ERP
        </p>
      </div>
    </div>
  );
}
