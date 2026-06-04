"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList, Wrench, ChevronRight, ChevronDown,
  LogOut, BookOpen, FilePlus, PauseCircle,
  Archive, Truck, Package, Layers, Building, Play,
  BarChart2, Users, ShieldCheck, Shield, MessageSquare, Home,
  FileText, FolderKanban, Menu, X, KeyRound,
} from "lucide-react";
import { getRol, OTURUM_ANAHTARI, ROL_ANAHTARI } from "./AuthGuard";
import { useEffect, useState } from "react";
import type { KullaniciRol } from "@/data/types";
import { okunmamisSayisi } from "@/lib/mesajlar";
import { ROL_ETIKETI, erisimVar } from "@/lib/izinler";
import { apiSifreDegistir } from "@/lib/api";

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
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
      isActive ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-slate-700 hover:text-white"
    }`;
  }

  function izinli(sayfa: string) { return erisimVar(rol, sayfa); }
  const depoAktif = pathname.startsWith("/depo");
  const depoIzni  = izinli("/depo");

  return (
    <>
      {/* Mobil hamburger */}
      <button onClick={() => setMobilAcik(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center shadow-lg">
        <Menu size={20}/>
      </button>

      {/* Mobil overlay */}
      {mobilAcik && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobilAcik(false)}/>
      )}

      {/* Sidebar */}
      <aside className={`h-screen w-60 bg-slate-800 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-200
        ${mobilAcik ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <img src="/logo.svg" alt="NexPlan" className="w-8 h-8 flex-shrink-0"/>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm leading-none">NexPlan</p>
            <p className="text-slate-400 text-xs mt-0.5">ERP Portal</p>
          </div>
          <button onClick={() => setMobilAcik(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={18}/>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {izinli("/anasayfa") && (
            <Link href="/anasayfa" className={linkClass("/anasayfa")}>
              <Home size={16}/><span className="flex-1">Ana Sayfa</span>
              {pathname === "/anasayfa" && <ChevronRight size={14}/>}
            </Link>
          )}
          {izinli("/raporlar") && (
            <Link href="/raporlar" className={linkClass("/raporlar")}>
              <BarChart2 size={16}/><span className="flex-1">Raporlar</span>
            </Link>
          )}
          {izinli("/uretim-emri") && (
            <Link href="/uretim-emri" className={linkClass("/uretim-emri")}>
              <FilePlus size={16}/><span className="flex-1">Üretim Emri Gir</span>
            </Link>
          )}
          {izinli("/is-emirleri") && (
            <Link href="/is-emirleri" className={linkClass("/is-emirleri")}>
              <ClipboardList size={16}/><span className="flex-1">İş Emirleri</span>
            </Link>
          )}
          {izinli("/operasyon-takibi") && (
            <Link href="/operasyon-takibi" className={linkClass("/operasyon-takibi")}>
              <Play size={16}/><span className="flex-1">Operasyon Takibi</span>
            </Link>
          )}
          {izinli("/kalite-kontrol") && (
            <Link href="/kalite-kontrol" className={linkClass("/kalite-kontrol")}>
              <ShieldCheck size={16}/><span className="flex-1">Kalite Kontrol</span>
            </Link>
          )}
          {izinli("/urun-katalogu") && (
            <Link href="/urun-katalogu" className={linkClass("/urun-katalogu")}>
              <BookOpen size={16}/><span className="flex-1">Ürün Kataloğu</span>
            </Link>
          )}
          {izinli("/durus-kaydi") && (
            <Link href="/durus-kaydi" className={linkClass("/durus-kaydi")}>
              <PauseCircle size={16}/><span className="flex-1">Duruş Kaydı</span>
            </Link>
          )}
          {izinli("/makinalar") && (
            <Link href="/makinalar" className={linkClass("/makinalar")}>
              <Wrench size={16}/><span className="flex-1">Makinalar</span>
            </Link>
          )}
          {izinli("/personel") && (
            <Link href="/personel" className={linkClass("/personel")}>
              <Users size={16}/><span className="flex-1">Personel</span>
            </Link>
          )}
          {izinli("/mesajlar") && (
            <Link href="/mesajlar" className={linkClass("/mesajlar")}>
              <MessageSquare size={16}/><span className="flex-1">Mesajlar</span>
              {okunmamis > 0
                ? <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{okunmamis}</span>
                : pathname.startsWith("/mesajlar") && <ChevronRight size={14}/>}
            </Link>
          )}
          {depoIzni && (
            <div>
              <button onClick={() => setDepoAcik(v => !v)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${depoAktif ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
                <Archive size={16}/><span className="flex-1 text-left">Depo</span>
                {depoAcik ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
              </button>
              {depoAcik && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700 pl-3">
                  <Link href="/depo/sevkiyat" className={linkClass("/depo/sevkiyat")}>
                    <Truck size={14}/><span className="flex-1">Sevkiyat Depo</span>
                  </Link>
                  <Link href="/depo/uretim" className={linkClass("/depo/uretim")}>
                    <Package size={14}/><span className="flex-1">Üretim Depo</span>
                  </Link>
                </div>
              )}
            </div>
          )}
          {izinli("/malzeme") && (
            <Link href="/malzeme" className={linkClass("/malzeme")}>
              <Layers size={16}/><span className="flex-1">Malzeme</span>
            </Link>
          )}
          {izinli("/sabit-kiymet") && (
            <Link href="/sabit-kiymet" className={linkClass("/sabit-kiymet")}>
              <Building size={16}/><span className="flex-1">Sabit Kıymet</span>
            </Link>
          )}
          {izinli("/fatura") && (
            <Link href="/fatura" className={linkClass("/fatura")}>
              <FileText size={16}/><span className="flex-1">Fatura / İrsaliye</span>
            </Link>
          )}
          {izinli("/projeler") && (
            <Link href="/projeler" className={linkClass("/projeler")}>
              <FolderKanban size={16}/><span className="flex-1">Proje Yönetim</span>
            </Link>
          )}
          {izinli("/kullanicilar") && (
            <>
              <div className="my-1 border-t border-slate-700/60"/>
              <Link href="/kullanicilar" className={linkClass("/kullanicilar")}>
                <Shield size={16}/><span className="flex-1">Kullanıcılar</span>
              </Link>
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700 space-y-1">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 text-xs font-bold uppercase">{(kulAdi || "?")[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{kulAdi || "—"}</p>
              <p className="text-slate-400 text-xs truncate">{rol ? ROL_ETIKETI[rol] : "—"}</p>
            </div>
          </div>
          <button onClick={() => setSifreModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <KeyRound size={16}/>Şifre Değiştir
          </button>
          <button onClick={handleCikis}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={16}/>Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Şifre Değiştir Modalı */}
      {sifreModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setSifreModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-800 font-semibold flex items-center gap-2">
                <KeyRound size={18} className="text-blue-500"/> Şifre Değiştir
              </h2>
              <button onClick={() => setSifreModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={handleSifreDegistir} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Mevcut Şifre</label>
                <input type="password" value={eskiSifre} onChange={e => setEskiSifre(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Yeni Şifre</label>
                <input type="password" value={yeniSifre} onChange={e => setYeniSifre(e.target.value)}
                  placeholder="En az 4 karakter"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
              </div>
              {sifreHata   && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{sifreHata}</p>}
              {sifreBasari && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">✅ Şifre başarıyla değiştirildi!</p>}
              <button type="submit"
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                Değiştir
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
