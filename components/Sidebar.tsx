"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList, Wrench, ChevronRight, ChevronDown,
  LogOut, BookOpen, FilePlus, PauseCircle,
  Archive, Truck, Package, Layers, Building, Play,
  BarChart2, Users, ShieldCheck, Shield, MessageSquare, Home,
  FileText, FolderKanban, Menu, X, KeyRound, Cpu,
} from "lucide-react";
import { getRol, OTURUM_ANAHTARI, ROL_ANAHTARI } from "./AuthGuard";
import { useEffect, useState } from "react";
import type { KullaniciRol } from "@/data/types";
import { okunmamisSayisi } from "@/lib/mesajlar";
import { ROL_ETIKETI, erisimVar } from "@/lib/izinler";
import { apiSifreDegistir } from "@/lib/api";

function selamla(ad: string) {
  const saat = new Date().getHours();
  const isim = ad ? ad.charAt(0).toUpperCase() + ad.slice(1) : "";
  if (saat < 12) return `Günaydın${isim ? `, ${isim}` : ""}! ☀️`;
  if (saat < 18) return `İyi öğleden sonralar${isim ? `, ${isim}` : ""}! 👋`;
  return `İyi akşamlar${isim ? `, ${isim}` : ""}! 🌙`;
}

function NavGroup({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 select-none">
      {label}
    </p>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [rol,         setRol]         = useState<KullaniciRol | null>(null);
  const [depoAcik,    setDepoAcik]    = useState(false);
  const [okunmamis,   setOkunmamis]   = useState(0);
  const [kulAdi,      setKulAdi]      = useState("");
  const [mobilAcik,   setMobilAcik]   = useState(false);
  const [sifreModal,  setSifreModal]  = useState(false);
  const [eskiSifre,   setEskiSifre]   = useState("");
  const [yeniSifre,   setYeniSifre]   = useState("");
  const [sifreHata,   setSifreHata]   = useState("");
  const [sifreBasari, setSifreBasari] = useState(false);

  useEffect(() => {
    const r = getRol();
    setRol(r);
    if (pathname.startsWith("/depo")) setDepoAcik(true);
    setMobilAcik(false);
    const ad = localStorage.getItem("uretim_kullanici_adi") ?? "";
    setKulAdi(ad);
    if (!ad) return;
    okunmamisSayisi(ad).then(setOkunmamis);
    const id = setInterval(() => okunmamisSayisi(ad).then(setOkunmamis), 10_000);
    return () => clearInterval(id);
  }, [pathname]);

  async function handleSifreDegistir(e: React.FormEvent) {
    e.preventDefault();
    setSifreHata(""); setSifreBasari(false);
    try {
      await apiSifreDegistir(kulAdi, eskiSifre, yeniSifre);
      setSifreBasari(true);
      setEskiSifre(""); setYeniSifre("");
      setTimeout(() => { setSifreModal(false); setSifreBasari(false); }, 2000);
    } catch (err: unknown) {
      setSifreHata(err instanceof Error ? err.message : "Şifre değiştirilemedi");
    }
  }

  function handleCikis() {
    localStorage.removeItem(OTURUM_ANAHTARI);
    localStorage.removeItem(ROL_ANAHTARI);
    localStorage.removeItem("uretim_kullanici_adi");
    router.replace("/giris");
  }

  function linkClass(href: string) {
    const isActive = pathname.startsWith(href);
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-white/10 text-white shadow-sm"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`;
  }

  function izinli(sayfa: string) { return erisimVar(rol, sayfa); }
  const depoAktif = pathname.startsWith("/depo");
  const depoIzni  = izinli("/depo");

  // Avatar rengi
  const avatarRenkler = ["from-blue-500 to-indigo-600","from-violet-500 to-purple-600","from-emerald-500 to-teal-600","from-rose-500 to-pink-600","from-amber-500 to-orange-600"];
  const avatarRenk = kulAdi ? avatarRenkler[kulAdi.charCodeAt(0) % avatarRenkler.length] : avatarRenkler[0];

  return (
    <>
      {/* Mobil hamburger */}
      <button onClick={() => setMobilAcik(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
        <Menu size={20}/>
      </button>

      {/* Mobil overlay */}
      {mobilAcik && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setMobilAcik(false)}/>
      )}

      {/* Sidebar */}
      <aside className={`h-screen w-60 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-200
        ${mobilAcik ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ background: "linear-gradient(180deg, #0f1629 0%, #151d35 60%, #111827 100%)" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <img src="/logo.svg" alt="NexPlan" className="w-5 h-5"/>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm leading-none tracking-wide">NexPlan</p>
            <p className="text-slate-400 text-[10px] mt-0.5 font-medium">ERP Sistemi</p>
          </div>
          <button onClick={() => setMobilAcik(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={18}/>
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0 overflow-y-auto scrollbar-thin">

          {/* Genel */}
          {(izinli("/anasayfa") || izinli("/raporlar")) && (
            <NavGroup label="Genel" />
          )}
          {izinli("/anasayfa") && (
            <Link href="/anasayfa" className={linkClass("/anasayfa")}>
              <Home size={15}/><span className="flex-1">Ana Sayfa</span>
              {pathname === "/anasayfa" && <ChevronRight size={12} className="opacity-60"/>}
            </Link>
          )}
          {izinli("/raporlar") && (
            <Link href="/raporlar" className={linkClass("/raporlar")}>
              <BarChart2 size={15}/><span className="flex-1">Raporlar</span>
            </Link>
          )}

          {/* Üretim */}
          {(izinli("/uretim-emri") || izinli("/is-emirleri") || izinli("/operasyon-takibi") || izinli("/kalite-kontrol") || izinli("/durus-kaydi") || izinli("/makinalar")) && (
            <NavGroup label="Üretim" />
          )}
          {izinli("/uretim-emri") && (
            <Link href="/uretim-emri" className={linkClass("/uretim-emri")}>
              <FilePlus size={15}/><span className="flex-1">Üretim Emri Gir</span>
            </Link>
          )}
          {izinli("/is-emirleri") && (
            <Link href="/is-emirleri" className={linkClass("/is-emirleri")}>
              <ClipboardList size={15}/><span className="flex-1">İş Emirleri</span>
            </Link>
          )}
          {izinli("/operasyon-takibi") && (
            <Link href="/operasyon-takibi" className={linkClass("/operasyon-takibi")}>
              <Play size={15}/><span className="flex-1">Operasyon Takibi</span>
            </Link>
          )}
          {izinli("/kalite-kontrol") && (
            <Link href="/kalite-kontrol" className={linkClass("/kalite-kontrol")}>
              <ShieldCheck size={15}/><span className="flex-1">Kalite Kontrol</span>
            </Link>
          )}
          {izinli("/durus-kaydi") && (
            <Link href="/durus-kaydi" className={linkClass("/durus-kaydi")}>
              <PauseCircle size={15}/><span className="flex-1">Duruş Kaydı</span>
            </Link>
          )}
          {izinli("/makinalar") && (
            <Link href="/makinalar" className={linkClass("/makinalar")}>
              <Cpu size={15}/><span className="flex-1">Makinalar</span>
            </Link>
          )}

          {/* Stok & Depo */}
          {(izinli("/malzeme") || izinli("/urun-katalogu") || depoIzni) && (
            <NavGroup label="Stok & Depo" />
          )}
          {izinli("/malzeme") && (
            <Link href="/malzeme" className={linkClass("/malzeme")}>
              <Layers size={15}/><span className="flex-1">Malzeme</span>
            </Link>
          )}
          {izinli("/urun-katalogu") && (
            <Link href="/urun-katalogu" className={linkClass("/urun-katalogu")}>
              <BookOpen size={15}/><span className="flex-1">Ürün Kataloğu</span>
            </Link>
          )}
          {depoIzni && (
            <div>
              <button onClick={() => setDepoAcik(v => !v)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${depoAktif ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
                <Archive size={15}/><span className="flex-1 text-left">Depo</span>
                {depoAcik ? <ChevronDown size={12} className="opacity-60"/> : <ChevronRight size={12} className="opacity-60"/>}
              </button>
              {depoAcik && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  <Link href="/depo/sevkiyat" className={linkClass("/depo/sevkiyat")}>
                    <Truck size={13}/><span className="flex-1">Sevkiyat Depo</span>
                  </Link>
                  <Link href="/depo/uretim" className={linkClass("/depo/uretim")}>
                    <Package size={13}/><span className="flex-1">Üretim Depo</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Finans & Projeler */}
          {(izinli("/fatura") || izinli("/projeler") || izinli("/sabit-kiymet")) && (
            <NavGroup label="Finans & Projeler" />
          )}
          {izinli("/fatura") && (
            <Link href="/fatura" className={linkClass("/fatura")}>
              <FileText size={15}/><span className="flex-1">Fatura / İrsaliye</span>
            </Link>
          )}
          {izinli("/projeler") && (
            <Link href="/projeler" className={linkClass("/projeler")}>
              <FolderKanban size={15}/><span className="flex-1">Proje Yönetim</span>
            </Link>
          )}
          {izinli("/sabit-kiymet") && (
            <Link href="/sabit-kiymet" className={linkClass("/sabit-kiymet")}>
              <Building size={15}/><span className="flex-1">Sabit Kıymet</span>
            </Link>
          )}

          {/* İletişim */}
          {(izinli("/mesajlar") || izinli("/personel")) && (
            <NavGroup label="İletişim & İK" />
          )}
          {izinli("/personel") && (
            <Link href="/personel" className={linkClass("/personel")}>
              <Users size={15}/><span className="flex-1">Personel</span>
            </Link>
          )}
          {izinli("/mesajlar") && (
            <Link href="/mesajlar" className={linkClass("/mesajlar")}>
              <MessageSquare size={15}/><span className="flex-1">Mesajlar</span>
              {okunmamis > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
                  {okunmamis > 9 ? "9+" : okunmamis}
                </span>
              )}
            </Link>
          )}

          {/* Sistem */}
          {izinli("/kullanicilar") && (
            <>
              <NavGroup label="Sistem" />
              <Link href="/kullanicilar" className={linkClass("/kullanicilar")}>
                <Shield size={15}/><span className="flex-1">Kullanıcılar</span>
              </Link>
            </>
          )}
        </nav>

        {/* Kullanıcı bölümü */}
        <div className="px-3 py-3 border-t border-white/5">
          {/* Selamlama */}
          <div className="px-3 py-2.5 mb-1 rounded-xl bg-white/5">
            <p className="text-white/70 text-[11px] leading-relaxed">{selamla(kulAdi)}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatarRenk} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-[10px] font-bold uppercase">{(kulAdi || "?")[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{kulAdi || "—"}</p>
                <p className="text-slate-400 text-[10px] truncate">{rol ? ROL_ETIKETI[rol] : "—"}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setSifreModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
            <KeyRound size={14}/><span>Şifremi Değiştir</span>
          </button>
          <button onClick={handleCikis}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={14}/><span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Şifre Değiştir Modalı */}
      {sifreModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSifreModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-slate-800 font-semibold flex items-center gap-2">
                  <KeyRound size={18} className="text-blue-500"/> Şifre Değiştir
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Güvenliğin için düzenli değiştirmeyi unutma</p>
              </div>
              <button onClick={() => setSifreModal(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={handleSifreDegistir} className="space-y-4">
              {[
                { label: "Mevcut Şifre", value: eskiSifre, onChange: setEskiSifre },
                { label: "Yeni Şifre",   value: yeniSifre, onChange: setYeniSifre, placeholder: "En az 4 karakter" },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{f.label}</label>
                  <input type="password" value={f.value} onChange={e => f.onChange(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all hover:border-slate-300"/>
                </div>
              ))}
              {sifreHata   && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-shake">{sifreHata}</p>}
              {sifreBasari && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">✅ Şifren başarıyla değiştirildi!</p>}
              <button type="submit"
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
                Şifremi Güncelle
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
