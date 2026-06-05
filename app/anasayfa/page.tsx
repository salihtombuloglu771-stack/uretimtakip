"use client";

import {
  apiGetIsEmirleri, apiGetMakinalar, apiGetKalite,
  apiGetMalzemeler, apiGetDurus, apiGetOperasyonlar,
} from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import PageLayout from "@/components/PageLayout";
import EmptyState from "@/components/EmptyState";
import {
  FilePlus, Cpu, ShieldCheck, Layers,
  TrendingUp, Clock, AlertTriangle, Play,
  CheckCircle, XCircle, Package,
  Sun, Sunset, Moon,
} from "lucide-react";
import Link from "next/link";
import { getRol } from "@/components/AuthGuard";

function selamla(kulAdi: string) {
  const saat = new Date().getHours();
  const isim = kulAdi ? kulAdi.charAt(0).toUpperCase() + kulAdi.slice(1) : "";
  if (saat < 12) return { mesaj: `Günaydın${isim ? `, ${isim}` : ""}!`, ikon: Sun,    renk: "text-amber-500" };
  if (saat < 18) return { mesaj: `İyi öğleden sonralar${isim ? `, ${isim}` : ""}!`, ikon: Sunset, renk: "text-orange-400" };
  return       { mesaj: `İyi akşamlar${isim ? `, ${isim}` : ""}!`, ikon: Moon,   renk: "text-indigo-400" };
}

function tarihYaz(str: string) {
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const bugun = new Date();
  const dun   = new Date(); dun.setDate(dun.getDate() - 1);
  if (d.toDateString() === bugun.toDateString())
    return "Bugün " + d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === dun.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function bugunMu(str: string) {
  return new Date(str).toDateString() === new Date().toDateString();
}

export default function AnasayfaPage() {
  const [yukluyor, setYukluyor] = useState(true);
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [kulAdi,   setKulAdi]   = useState("");

  const [isEmirleri,  setIsEmirleri]  = useState<Awaited<ReturnType<typeof apiGetIsEmirleri>>>([]);
  const [makinalar,   setMakinalar]   = useState<Awaited<ReturnType<typeof apiGetMakinalar>>>([]);
  const [kaliteler,   setKaliteler]   = useState<Awaited<ReturnType<typeof apiGetKalite>>>([]);
  const [malzemeler,  setMalzemeler]  = useState<Awaited<ReturnType<typeof apiGetMalzemeler>>>([]);
  const [duruslar,    setDuruslar]    = useState<Awaited<ReturnType<typeof apiGetDurus>>>([]);
  const [operasyonlar,setOperasyonlar]= useState<Awaited<ReturnType<typeof apiGetOperasyonlar>>>([]);

  const yukle = useCallback(async () => {
    setYukluyor(true);
    const [ie, mk, kk, mlz, dr, op] = await Promise.all([
      apiGetIsEmirleri().catch(() => []),
      apiGetMakinalar().catch(() => []),
      apiGetKalite().catch(() => []),
      apiGetMalzemeler().catch(() => []),
      apiGetDurus().catch(() => []),
      apiGetOperasyonlar().catch(() => []),
    ]);
    setIsEmirleri(ie);   setMakinalar(mk);   setKaliteler(kk);
    setMalzemeler(mlz);  setDuruslar(dr);    setOperasyonlar(op);
    setYukluyor(false);
  }, []);

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    setKulAdi(localStorage.getItem("uretim_kullanici_adi") ?? "");
    yukle();
  }, [yukle]);

  // Hesaplamalar
  const aktifMakina    = makinalar.filter(m => m.durum === "aktif").length;
  const bugunIE        = isEmirleri.filter(k => bugunMu(k.tarih));
  const bugunUretim    = bugunIE.reduce((s, k) => s + k.uretimAdedi, 0);
  const bugunFire      = bugunIE.reduce((s, k) => s + k.fireAdedi,   0);
  const fireOrani      = bugunUretim + bugunFire > 0
    ? ((bugunFire / (bugunUretim + bugunFire)) * 100).toFixed(1)
    : "0.0";
  const aktifOp        = operasyonlar.filter(o => !o.bitis).length;
  const bekleyenKK     = kaliteler.filter(k => k.sonuc === "kaldi").length;
  const kritikStok     = malzemeler.filter(m => m.stokMiktari < 10).length;

  // Son aktiviteler (son 8)
  interface AktiviteItem {
    id: string; tip: string; baslik: string; tarih: string;
    renk: string; ikon: React.ReactNode;
  }
  const aktiviteler: AktiviteItem[] = [
    ...isEmirleri.slice(-4).reverse().map(k => ({
      id: `ie-${k.id}`, tip: "İş Emri",
      baslik: `${k.isEmriNo} — ${k.urunAdi} (${k.uretimAdedi.toLocaleString("tr-TR")} adet)`,
      tarih: k.tarih, renk: "text-blue-600 bg-blue-50",
      ikon: <FilePlus size={13} />,
    })),
    ...kaliteler.slice(-4).reverse().map(k => ({
      id: `kk-${k.id}`, tip: "Kalite",
      baslik: `${k.isEmriNo} — ${k.sonuc === "gecti" ? "Geçti ✓" : "Kaldı ✗"} (${k.kontrolEden})`,
      tarih: k.kontrolTarihi, renk: k.sonuc === "gecti" ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50",
      ikon: k.sonuc === "gecti" ? <CheckCircle size={13} /> : <XCircle size={13} />,
    })),
  ].sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()).slice(0, 8);

  const OZET_KARTLAR = [
    {
      baslik: "Bugün Üretim",
      deger: bugunUretim.toLocaleString("tr-TR"),
      alt: `${bugunIE.length} iş emri · Fire: %${fireOrani}`,
      renk: "text-blue-600", bg: "bg-blue-50",
      ikon: <FilePlus size={20} />,
      href: "/is-emirleri",
    },
    {
      baslik: "Aktif Makina",
      deger: `${aktifMakina}/${makinalar.length}`,
      alt: aktifMakina < makinalar.length ? `${makinalar.length - aktifMakina} pasif` : "Tümü çalışıyor",
      renk: "text-emerald-600", bg: "bg-emerald-50",
      ikon: <Cpu size={20} />,
      href: "/makinalar",
    },
    {
      baslik: "Aktif Operasyon",
      deger: String(aktifOp),
      alt: `${operasyonlar.length} toplam operasyon`,
      renk: "text-violet-600", bg: "bg-violet-50",
      ikon: <Play size={20} />,
      href: "/operasyon-takibi",
    },
    {
      baslik: "Kalite Red",
      deger: String(bekleyenKK),
      alt: `${kaliteler.length} toplam kontrol`,
      renk: bekleyenKK > 0 ? "text-red-600" : "text-slate-500",
      bg:   bekleyenKK > 0 ? "bg-red-50"    : "bg-slate-50",
      ikon: <ShieldCheck size={20} />,
      href: "/kalite-kontrol",
    },
    {
      baslik: "Duruş Kaydı",
      deger: String(duruslar.length),
      alt: "Toplam kayıt",
      renk: "text-amber-600", bg: "bg-amber-50",
      ikon: <Clock size={20} />,
      href: "/durus-kaydi",
    },
    {
      baslik: "Kritik Stok",
      deger: String(kritikStok),
      alt: `${malzemeler.length} malzeme · <10 birim`,
      renk: kritikStok > 0 ? "text-orange-600" : "text-slate-500",
      bg:   kritikStok > 0 ? "bg-orange-50"    : "bg-slate-50",
      ikon: <Layers size={20} />,
      href: "/malzeme",
    },
  ];

  const HIZLI_ERISIM = [
    { href: "/uretim-emri",      label: "Üretim Emri Gir",   renk: "bg-blue-500 hover:bg-blue-600" },
    { href: "/kalite-kontrol",   label: "Kalite Kontrol",    renk: "bg-emerald-500 hover:bg-emerald-600" },
    { href: "/durus-kaydi",      label: "Duruş Kaydet",      renk: "bg-amber-500 hover:bg-amber-600" },
    { href: "/malzeme",          label: "Malzeme",           renk: "bg-violet-500 hover:bg-violet-600" },
    ...(isAdmin ? [
      { href: "/raporlar",       label: "Raporlar",          renk: "bg-slate-600 hover:bg-slate-700" },
      { href: "/personel",       label: "Personel",          renk: "bg-teal-500 hover:bg-teal-600" },
    ] : []),
  ];

  const tarih = new Date().toLocaleDateString("tr-TR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const slam = selamla(kulAdi);
  const SlamIkon = slam.ikon;

  return (
    <PageLayout
      baslik="Ana Sayfa"
      altyazi={tarih}
      yenile={yukle}
      yukleniyor={yukluyor}
    >
      {/* Kişisel karşılama */}
      <div className="animate-fade-in-up flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <SlamIkon size={20} className={slam.renk} />
          </div>
          <div>
            <p className="text-slate-800 font-semibold text-sm">{slam.mesaj}</p>
            <p className="text-slate-400 text-xs mt-0.5 capitalize">{tarih}</p>
          </div>
        </div>
        {bugunUretim > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <CheckCircle size={12} /> Bugün {bugunUretim.toLocaleString("tr-TR")} adet üretildi
          </div>
        )}
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {OZET_KARTLAR.map((k, i) => (
          <Link key={k.baslik} href={k.href}
            className="animate-fade-in-up bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all group"
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.bg} ${k.renk}`}>
                {k.ikon}
              </div>
              {k.deger !== "0" && k.baslik === "Kritik Stok" && (
                <AlertTriangle size={14} className="text-orange-400" />
              )}
            </div>
            <p className={`text-2xl font-bold leading-none ${k.renk}`}>{k.deger}</p>
            <p className="text-slate-500 text-xs font-medium mt-1">{k.baslik}</p>
            <p className="text-slate-400 text-[11px] mt-0.5 truncate">{k.alt}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Son aktiviteler */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-800 font-semibold text-sm">Son Aktiviteler</h2>
            <span className="text-slate-400 text-xs">{aktiviteler.length} kayıt</span>
          </div>
          {yukluyor ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : aktiviteler.length === 0 ? (
            <EmptyState
              ikon={FilePlus}
              baslik="Henüz aktivite yok"
              aciklama="Üretim emri girildiğinde veya kalite kontrol yapıldığında burada görünür."
              buton={{ label: "İlk üretim emrini gir", href: "/uretim-emri" }}
              kucuk
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {aktiviteler.map((a, i) => (
                <div key={a.id}
                  className="animate-fade-in-up flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.renk}`}>
                    {a.ikon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm font-medium truncate">{a.baslik}</p>
                    <p className="text-slate-400 text-xs">{a.tip}</p>
                  </div>
                  <span className="text-slate-400 text-xs whitespace-nowrap flex-shrink-0">
                    {tarihYaz(a.tarih)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hızlı erişim + durum özeti */}
        <div className="space-y-4">
          {/* Hızlı erişim */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-slate-800 font-semibold text-sm mb-3">Hızlı Erişim</h2>
            <div className="grid grid-cols-2 gap-2">
              {HIZLI_ERISIM.map(({ href, label, renk }) => (
                <Link key={href} href={href}
                  className={`${renk} text-white text-xs font-medium px-3 py-2.5 rounded-lg text-center transition-colors`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Sistem özet */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-slate-800 font-semibold text-sm mb-3">Sistem Durumu</h2>
            <div className="space-y-3">
              {[
                { label: "İş Emirleri",  deger: isEmirleri.length,  ikon: <FilePlus size={13}/>, renk: "text-blue-500" },
                { label: "Makinalar",    deger: makinalar.length,   ikon: <Cpu size={13}/>,      renk: "text-emerald-500" },
                { label: "Kalite Kont.", deger: kaliteler.length,   ikon: <ShieldCheck size={13}/>, renk: "text-violet-500" },
                { label: "Malzemeler",   deger: malzemeler.length,  ikon: <Package size={13}/>,  renk: "text-orange-500" },
                { label: "Operasyonlar", deger: operasyonlar.length,ikon: <TrendingUp size={13}/>,renk: "text-teal-500" },
              ].map(({ label, deger, ikon, renk }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-sm text-slate-600 ${renk}`}>
                    {ikon}
                    <span className="text-slate-600">{label}</span>
                  </div>
                  <span className="text-slate-800 font-semibold text-sm">{deger}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
