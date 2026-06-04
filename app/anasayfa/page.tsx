"use client";


import { apiGetDepo, apiGetIsEmirleri, apiGetKalite, apiGetMalzemeler } from "@/lib/api";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard, { getRol } from "@/components/AuthGuard";
import {
  FilePlus, Layers, ShieldCheck, Archive,
  Home, User, Clock, RefreshCw, AlertCircle,
} from "lucide-react";


interface Kayit {
  id:         string;
  kategori:   string;
  baslik:     string;
  detay:      string;
  tarih:      string;
  kayitYapan?: string;
  renkSinif: string;
}

function tarihYaz(str: string) {
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const bugun = new Date();
  const dun   = new Date(); dun.setDate(dun.getDate() - 1);
  if (d.toDateString() === bugun.toDateString())
    return "Bugün " + d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === dun.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function AnasayfaPage() {
  const [kayitlar,  setKayitlar]  = useState<Kayit[]>([]);
  const [yukluyor,  setYukluyor]  = useState(true);
  const [hata,      setHata]      = useState("");
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [filtre,    setFiltre]    = useState("hepsi");
  const [sayilar,   setSayilar]   = useState({ ie: 0, mlz: 0, kk: 0, depo: 0 });

  async function yukle() {
    setYukluyor(true);
    setHata("");
    try {
      const [isEmirleri, malzemeler, kaliteler, depoList] = await Promise.all([
        apiGetIsEmirleri().catch(() => []),
        apiGetMalzemeler().catch(() => []),
        apiGetKalite().catch(() => []),
        apiGetDepo().catch(() => []),
      ]);

      setSayilar({ ie: isEmirleri.length, mlz: malzemeler.length, kk: kaliteler.length, depo: depoList.length });

      const liste: Kayit[] = [
        ...isEmirleri.map(k => ({
          id: k.id, kategori: "İş Emri",
          baslik: `${k.isEmriNo} — ${k.urunAdi}`,
          detay: `${k.uretimAdedi.toLocaleString("tr-TR")} üretim · ${k.fireAdedi} fire${k.makinaNo ? ` · ${k.makinaNo}` : ""}${k.vardiya ? ` · ${k.vardiya}` : ""}`,
          tarih: k.tarih, kayitYapan: k.kayitYapan,
          renkSinif: "bg-blue-50 text-blue-700 border-blue-200",
        })),
        ...malzemeler.map(m => ({
          id: m.id, kategori: "Malzeme",
          baslik: `${m.malzemeAdi} (${m.malzemeKodu})`,
          detay: `${m.stokMiktari.toLocaleString("tr-TR")} ${m.birim}${m.birimFiyat ? ` · ${m.birimFiyat.toLocaleString("tr-TR")} ₺/birim` : ""}`,
          tarih: new Date().toISOString(), kayitYapan: m.kayitYapan,
          renkSinif: "bg-violet-50 text-violet-700 border-violet-200",
        })),
        ...kaliteler.map(k => ({
          id: k.id, kategori: "Kalite Kontrol",
          baslik: `${k.isEmriNo} — ${k.urunAdi}`,
          detay: `${k.sonuc === "gecti" ? "✓ Geçti" : "✗ Kaldı"} · Uygun: ${k.uygunAdet} · Uygunsuz: ${k.uygunsuzAdet} · ${k.kontrolEden}`,
          tarih: k.kontrolTarihi, kayitYapan: k.kayitYapan,
          renkSinif: k.sonuc === "gecti" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200",
        })),
        ...depoList.map(d => ({
          id: d.id, kategori: `Depo (${d.depoTuru === "sevkiyat" ? "Sevkiyat" : "Üretim"})`,
          baslik: `${d.hareketTuru === "giris" ? "Giriş" : "Çıkış"} — ${d.urunAdi}`,
          detay: `${d.miktar.toLocaleString("tr-TR")} ${d.birim}${d.aciklama ? ` · ${d.aciklama}` : ""}`,
          tarih: d.tarih, kayitYapan: d.kayitYapan,
          renkSinif: d.hareketTuru === "giris" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200",
        })),
      ];

      liste.sort((a, b) => {
        const ta = new Date(a.tarih).getTime();
        const tb = new Date(b.tarih).getTime();
        return isNaN(tb) || isNaN(ta) ? 0 : tb - ta;
      });

      setKayitlar(liste);
    } catch (e) {
      console.error(e);
      setHata("Veriler yüklenirken hata oluştu.");
    } finally {
      setYukluyor(false);
    }
  }

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    yukle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const KATEGORILER = ["hepsi", "İş Emri", "Malzeme", "Kalite Kontrol", "Depo"];
  const gorunen = filtre === "hepsi" ? kayitlar : kayitlar.filter(k => k.kategori.startsWith(filtre));

  const OZET = [
    { label: "İş Emri",        sayi: sayilar.ie,   ikon: FilePlus,    renk: "text-blue-600 bg-blue-50"    },
    { label: "Malzeme",         sayi: sayilar.mlz,  ikon: Layers,      renk: "text-violet-600 bg-violet-50" },
    { label: "Kalite Kontrol",  sayi: sayilar.kk,   ikon: ShieldCheck, renk: "text-emerald-600 bg-emerald-50" },
    { label: "Depo Hareketi",   sayi: sayilar.depo, ikon: Archive,     renk: "text-orange-600 bg-orange-50" },
  ];

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 md:ml-60 p-6 space-y-6">

        {/* Başlık */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold flex items-center gap-2">
              <Home size={22} className="text-blue-500" /> Ana Sayfa
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Sistemdeki tüm kayıtlar</p>
          </div>
          <button onClick={yukle} className="flex items-center gap-2 text-slate-500 hover:text-blue-500 text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            <RefreshCw size={14} className={yukluyor ? "animate-spin" : ""} /> Yenile
          </button>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {OZET.map(({ label, sayi, ikon: Ikon, renk }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${renk}`}>
                <Ikon size={18} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">{label}</p>
                <p className="text-slate-800 text-2xl font-bold leading-none mt-0.5">{sayi}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Kayıt tablosu */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          {/* Filtre sekmeleri */}
          <div className="flex border-b border-slate-100 overflow-x-auto px-2 pt-2 gap-1">
            {KATEGORILER.map(k => {
              const sayi = k === "hepsi" ? kayitlar.length : kayitlar.filter(r => r.kategori.startsWith(k)).length;
              return (
                <button key={k} onClick={() => setFiltre(k)}
                  className={`px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors border-b-2 ${
                    filtre === k
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}>
                  {k === "hepsi" ? "Tümü" : k}
                  <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{sayi}</span>
                </button>
              );
            })}
          </div>

          {/* İçerik */}
          {yukluyor ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hata ? (
            <div className="py-12 flex flex-col items-center gap-2 text-red-400">
              <AlertCircle size={32} />
              <p className="text-sm">{hata}</p>
            </div>
          ) : gorunen.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-slate-300">
              <Home size={40} />
              <p className="text-sm text-slate-400">Henüz kayıt yok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-slate-500 text-xs font-medium uppercase tracking-wide">Kategori</th>
                    <th className="px-5 py-3 text-left text-slate-500 text-xs font-medium uppercase tracking-wide">Başlık</th>
                    <th className="px-5 py-3 text-left text-slate-500 text-xs font-medium uppercase tracking-wide">Detay</th>
                    <th className="px-5 py-3 text-left text-slate-500 text-xs font-medium uppercase tracking-wide">Tarih</th>
                    {isAdmin && <th className="px-5 py-3 text-left text-slate-500 text-xs font-medium uppercase tracking-wide">Kaydeden</th>}
                  </tr>
                </thead>
                <tbody>
                  {gorunen.map((k, i) => (
                    <tr key={`${k.kategori}-${k.id}`}
                      className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/40" : ""}`}>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${k.renkSinif}`}>{k.kategori}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-800 font-medium max-w-[200px] truncate">{k.baslik}</td>
                      <td className="px-5 py-3 text-slate-500 max-w-[280px] truncate">{k.detay}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1"><Clock size={11} />{tarihYaz(k.tarih)}</span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          {k.kayitYapan ? (
                            <span className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                              <User size={12} className="text-blue-400" />{k.kayitYapan}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
    </AuthGuard>
  );
}
