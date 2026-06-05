"use client";

import {
  apiGetIsEmirleri, apiGetDurus, apiGetOperasyonlar, apiGetMakinalar,
  apiGetMalzemeler, apiGetKalite, apiGetFaturalar, apiGetProjeler, apiGetPersonel,
} from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import PageLayout from "@/components/PageLayout";
import {
  BarChart2, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Package, FileText, FolderKanban, Cpu, Clock, Users, Minus,
} from "lucide-react";
import type { IsEmri, Durus, Operasyon, Malzeme, KaliteKontrol, Fatura, Proje } from "@/data/types";

// ── Yardımcılar ──────────────────────────────────────────────────────────────
function hhmm(dk: number) {
  if (dk <= 0) return "0dk";
  const s = Math.floor(dk / 60), m = dk % 60;
  return s > 0 ? `${s}s ${m}dk` : `${m}dk`;
}

function Trend({ simdi, once, birim = "" }: { simdi: number; once: number; birim?: string }) {
  if (once === 0) return <span className="text-slate-400 text-xs">—</span>;
  const oran = ((simdi - once) / once) * 100;
  const artis = oran > 0;
  const color = artis ? "text-emerald-600" : "text-red-500";
  const Icon  = artis ? TrendingUp : oran < 0 ? TrendingDown : Minus;
  return (
    <span className={`text-xs flex items-center gap-0.5 ${color}`}>
      <Icon size={11} /> {Math.abs(oran).toFixed(1)}%{birim}
    </span>
  );
}

function Bar({ etiket, deger, maks, renk, alt }: { etiket: string; deger: number; maks: number; renk: string; alt?: string }) {
  const yuzde = maks > 0 ? Math.round((deger / maks) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-right">
        <span className="text-xs text-slate-600 truncate block">{etiket}</span>
        {alt && <span className="text-[10px] text-slate-400">{alt}</span>}
      </div>
      <div className="flex-1 bg-slate-100 rounded-full h-3">
        <div className={`h-3 rounded-full transition-all ${renk}`} style={{ width: `${yuzde}%` }} />
      </div>
      <span className="w-12 text-xs font-semibold text-slate-700 text-right">{deger.toLocaleString("tr-TR")}</span>
    </div>
  );
}

function Kpi({ label, deger, alt, renk = "text-slate-800", border = "border-slate-100", trend }: {
  label: string; deger: string | number; alt?: string; renk?: string; border?: string;
  trend?: { simdi: number; once: number };
}) {
  return (
    <div className={`bg-white border ${border} rounded-xl p-4 shadow-sm`}>
      <p className="text-slate-500 text-xs uppercase tracking-wide font-medium">{label}</p>
      <p className={`${renk} text-2xl font-bold mt-1 leading-none`}>{deger}</p>
      <div className="flex items-center justify-between mt-1.5">
        {alt && <p className="text-slate-400 text-xs">{alt}</p>}
        {trend && <Trend simdi={trend.simdi} once={trend.once} />}
      </div>
    </div>
  );
}

// ── Ana bileşen ──────────────────────────────────────────────────────────────
export default function RaporlarPage() {
  const [isEmirleri,  setIsEmirleri]  = useState<IsEmri[]>([]);
  const [duruslar,    setDuruslar]    = useState<Durus[]>([]);
  const [oplar,       setOplar]       = useState<Operasyon[]>([]);
  const [makinalar,   setMakinalar]   = useState<{ id: string; makinaNo: string; makinaAdi: string }[]>([]);
  const [malzemeler,  setMalzemeler]  = useState<Malzeme[]>([]);
  const [kalite,      setKalite]      = useState<KaliteKontrol[]>([]);
  const [faturalar,   setFaturalar]   = useState<Fatura[]>([]);
  const [projeler,    setProjeler]    = useState<Proje[]>([]);
  const [personel,    setPersonel]    = useState<{ id: string; adSoyad: string; durum: string }[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [aralik,      setAralik]      = useState<7 | 14 | 30>(30);

  const yukle = useCallback(async () => {
    setLoading(true);
    const [ie, dur, op, mak, mlz, kal, fat, prj, per] = await Promise.all([
      apiGetIsEmirleri().catch(() => []), apiGetDurus().catch(() => []),
      apiGetOperasyonlar().catch(() => []), apiGetMakinalar().catch(() => []),
      apiGetMalzemeler().catch(() => []), apiGetKalite().catch(() => []),
      apiGetFaturalar().catch(() => []), apiGetProjeler().catch(() => []),
      apiGetPersonel().catch(() => []),
    ]);
    setIsEmirleri(ie as IsEmri[]); setDuruslar(dur as Durus[]);
    setOplar(op as Operasyon[]); setMakinalar(mak as { id: string; makinaNo: string; makinaAdi: string }[]);
    setMalzemeler(mlz as Malzeme[]); setKalite(kal as KaliteKontrol[]);
    setFaturalar(fat as Fatura[]); setProjeler(prj as Proje[]);
    setPersonel(per as typeof personel);
    setLoading(false);
  }, []);

  useEffect(() => { yukle(); }, [yukle]);

  const bugun    = new Date();
  const aralikMs = aralik * 24 * 60 * 60 * 1000;
  const eskiBaslangic = new Date(bugun.getTime() - aralikMs * 2);
  const yeniBaslangic = new Date(bugun.getTime() - aralikMs);

  const aralikIE   = isEmirleri.filter(k => new Date(k.tarih) >= yeniBaslangic);
  const eskiIE     = isEmirleri.filter(k => new Date(k.tarih) >= eskiBaslangic && new Date(k.tarih) < yeniBaslangic);

  const topUretim  = aralikIE.reduce((t, k) => t + k.uretimAdedi, 0);
  const eskiUretim = eskiIE.reduce((t, k) => t + k.uretimAdedi, 0);
  const topFire    = aralikIE.reduce((t, k) => t + k.fireAdedi, 0);
  const eskiFire   = eskiIE.reduce((t, k) => t + k.fireAdedi, 0);
  const fireOrani  = topUretim > 0 ? ((topFire / topUretim) * 100).toFixed(2) : "0.00";
  const eskiFireO  = eskiUretim > 0 ? (eskiFire / eskiUretim) * 100 : 0;

  // Ürüne göre üretim
  const urunMap = new Map<string, { uretim: number; fire: number }>();
  aralikIE.forEach(k => {
    const m = urunMap.get(k.urunAdi) ?? { uretim: 0, fire: 0 };
    urunMap.set(k.urunAdi, { uretim: m.uretim + k.uretimAdedi, fire: m.fire + k.fireAdedi });
  });
  const topUrunler = [...urunMap.entries()].sort((a, b) => b[1].uretim - a[1].uretim).slice(0, 6);

  // Ürüne göre fire oranı
  const urunFireSirali = [...urunMap.entries()]
    .filter(([, v]) => v.uretim > 0)
    .map(([ad, v]) => ({ ad, oran: (v.fire / v.uretim) * 100, toplam: v.uretim }))
    .sort((a, b) => b.oran - a.oran).slice(0, 6);

  // Makina bazlı fire + utilization
  const makinaMap = new Map<string, { uretim: number; fire: number }>();
  aralikIE.filter(k => k.makinaNo).forEach(k => {
    const m = makinaMap.get(k.makinaNo) ?? { uretim: 0, fire: 0 };
    makinaMap.set(k.makinaNo, { uretim: m.uretim + k.uretimAdedi, fire: m.fire + k.fireAdedi });
  });

  // Vardiya bazlı üretim
  const vardiyaMap = { sabah: 0, oglen: 0, gece: 0, belirsiz: 0 };
  aralikIE.forEach(k => {
    if (k.vardiya === "sabah")     vardiyaMap.sabah    += k.uretimAdedi;
    else if (k.vardiya === "oglen") vardiyaMap.oglen   += k.uretimAdedi;
    else if (k.vardiya === "gece")  vardiyaMap.gece    += k.uretimAdedi;
    else                            vardiyaMap.belirsiz += k.uretimAdedi;
  });
  const maxVardiya = Math.max(vardiyaMap.sabah, vardiyaMap.oglen, vardiyaMap.gece, 1);

  // Duruş neden dağılımı
  const durusMap: Record<string, number> = { ariza: 0, bakim: 0, malzeme: 0, kalip: 0, diger: 0 };
  const aralikDurus = duruslar.filter(d => new Date(d.baslangicTarihi) >= yeniBaslangic);
  aralikDurus.forEach(d => {
    const dk = Math.max(0, Math.round((new Date(d.bitisTarihi).getTime() - new Date(d.baslangicTarihi).getTime()) / 60000));
    durusMap[d.neden] = (durusMap[d.neden] || 0) + dk;
  });
  const toplamDurusDk = Object.values(durusMap).reduce((a, b) => a + b, 0);

  // Günlük trend (aralik güne göre)
  const gunSayisi = Math.min(aralik, 30);
  const gunTrend = Array.from({ length: gunSayisi }, (_, i) => {
    const d = new Date(bugun); d.setDate(d.getDate() - (gunSayisi - 1 - i));
    const ymd = d.toISOString().split("T")[0];
    const gunIE = isEmirleri.filter(k => k.tarih === ymd);
    return {
      gun: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      uretim: gunIE.reduce((t, k) => t + k.uretimAdedi, 0),
      fire:   gunIE.reduce((t, k) => t + k.fireAdedi, 0),
    };
  });
  const maks7 = Math.max(...gunTrend.map(g => g.uretim), 1);

  // Kalite trend (7 gün)
  const kaliteTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bugun); d.setDate(d.getDate() - (6 - i));
    const ymd = d.toISOString().split("T")[0];
    const gunKal = kalite.filter(k => k.kontrolTarihi.startsWith(ymd));
    const gecti = gunKal.filter(k => k.sonuc === "gecti").length;
    return { gun: d.toLocaleDateString("tr-TR", { weekday: "short" }), gecti, toplam: gunKal.length };
  });

  // Kalite genel
  const aralikKalite  = kalite.filter(k => new Date(k.kontrolTarihi) >= yeniBaslangic);
  const kaliteGecti   = aralikKalite.filter(k => k.sonuc === "gecti").length;
  const kaliteKaldi   = aralikKalite.filter(k => k.sonuc === "kaldi").length;
  const kaliteOrani   = aralikKalite.length > 0 ? ((kaliteGecti / aralikKalite.length) * 100).toFixed(1) : "—";

  // Fatura
  const aralikFat     = faturalar.filter(f => new Date(f.tarih) >= yeniBaslangic && f.durum === "kesildi");
  const toplamCiro    = aralikFat.reduce((t, f) => t + f.genelToplam, 0);
  const eskiFat       = faturalar.filter(f => new Date(f.tarih) >= eskiBaslangic && new Date(f.tarih) < yeniBaslangic && f.durum === "kesildi");
  const eskiCiro      = eskiFat.reduce((t, f) => t + f.genelToplam, 0);

  // Stok uyarıları
  const sifirStok     = malzemeler.filter(m => m.stokMiktari === 0);
  const dusukStok     = malzemeler.filter(m => m.stokMiktari > 0 && m.stokMiktari <= 10);

  // Proje
  const aktifProje    = projeler.filter(p => p.durum === "aktif").length;
  const gecikmisPrj   = projeler.filter(p => p.durum === "aktif" && p.bitisTarihi && new Date(p.bitisTarihi) < bugun).length;
  const taslakFatura  = faturalar.filter(f => f.durum === "taslak").length;
  const aktifPersonel = personel.filter(p => p.durum === "aktif").length;

  const NEDEN_ETIKET: Record<string, string> = {
    ariza: "Arıza", bakim: "Bakım", malzeme: "Malzeme Yokluğu", kalip: "Kalıp", diger: "Diğer"
  };
  const NEDEN_RENK: Record<string, string> = {
    ariza: "bg-red-500", bakim: "bg-amber-500", malzeme: "bg-orange-500", kalip: "bg-violet-500", diger: "bg-slate-400"
  };

  return (
    <PageLayout baslik="Raporlar & Analiz" altyazi="Üretim performansı, kalite ve maliyet analizi" yenile={yukle} yukleniyor={loading}>

      {/* Zaman aralığı seçimi */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs font-medium">Analiz dönemi:</span>
        {([7, 14, 30] as const).map(g => (
          <button key={g} onClick={() => setAralik(g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${aralik === g ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}>
            Son {g} gün
          </button>
        ))}
      </div>

      {/* Kritik uyarılar */}
      {(sifirStok.length > 0 || gecikmisPrj > 0 || taslakFatura > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
          <p className="text-red-700 font-semibold text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> Acil Uyarılar
          </p>
          {sifirStok.length > 0 && (
            <p className="text-red-600 text-xs">
              🔴 {sifirStok.length} malzeme stokta sıfır — {sifirStok.slice(0, 3).map(m => m.malzemeAdi).join(", ")}
              {sifirStok.length > 3 ? ` ve ${sifirStok.length - 3} diğer` : ""}
            </p>
          )}
          {gecikmisPrj > 0 && <p className="text-red-600 text-xs">🔴 {gecikmisPrj} aktif proje bitiş tarihini geçti</p>}
          {taslakFatura > 0 && <p className="text-amber-600 text-xs">🟡 {taslakFatura} taslak fatura kesilmeyi bekliyor</p>}
          {dusukStok.length > 0 && <p className="text-amber-600 text-xs">🟡 {dusukStok.length} malzeme kritik stok seviyesinde (≤10 birim)</p>}
        </div>
      )}

      {/* Ana KPI Kartlar */}
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-500" /> Son {aralik} Gün Üretim KPI
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Toplam Üretim" deger={topUretim.toLocaleString("tr-TR")} renk="text-blue-600" border="border-blue-100"
            alt={`${aralikIE.length} iş emri`} trend={{ simdi: topUretim, once: eskiUretim }} />
          <Kpi label="Toplam Fire" deger={topFire.toLocaleString("tr-TR")} renk="text-red-500" border="border-red-100"
            alt="adet" trend={{ simdi: topFire, once: eskiFire }} />
          <Kpi label="Fire Oranı" deger={`%${fireOrani}`}
            renk={parseFloat(fireOrani) > 5 ? "text-red-500" : "text-emerald-600"}
            border={parseFloat(fireOrani) > 5 ? "border-red-100" : "border-emerald-100"}
            trend={{ simdi: parseFloat(fireOrani), once: eskiFireO }} />
          <Kpi label="Net Üretim Değeri"
            deger={aralikIE.reduce((t, k) => t + (k.uretimAdedi - k.fireAdedi) * (k.birimFiyat || 0), 0)
              .toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺"}
            renk="text-violet-700" border="border-violet-100" />
        </div>
      </div>

      {/* İkincil KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Kalite Geçme" deger={kalite.length > 0 ? `%${kaliteOrani}` : "—"}
          renk={parseFloat(kaliteOrani) >= 95 ? "text-emerald-600" : parseFloat(kaliteOrani) >= 80 ? "text-amber-500" : "text-red-500"}
          alt={`${kaliteGecti}G / ${kaliteKaldi}K`} />
        <Kpi label="Toplam Duruş" deger={hhmm(toplamDurusDk)} renk="text-orange-600"
          alt={`${aralikDurus.length} kayıt`} />
        <Kpi label="Toplam Ciro" deger={toplamCiro.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺"}
          renk="text-emerald-600" alt={`${aralikFat.length} fatura`}
          trend={{ simdi: toplamCiro, once: eskiCiro }} />
        <Kpi label="Aktif Proje" deger={aktifProje}
          renk={gecikmisPrj > 0 ? "text-red-500" : "text-blue-600"}
          alt={gecikmisPrj > 0 ? `${gecikmisPrj} gecikmiş` : "Zamanında"} />
        <Kpi label="Aktif Personel" deger={aktifPersonel} renk="text-teal-600"
          alt={`${personel.length} toplam kayıt`} />
      </div>

      {/* Grafik satırı 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Günlük üretim trendi */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-500" /> Günlük Üretim Trendi
          </h2>
          <div className="flex items-end gap-1" style={{ height: 96 }}>
            {gunTrend.map((g, i) => {
              const yuzde = (g.uretim / maks7) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  {g.uretim > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity z-10">
                      {g.uretim.toLocaleString("tr-TR")}
                    </div>
                  )}
                  <div className="w-full bg-slate-100 rounded-t relative" style={{ height: 80 }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t transition-all"
                      style={{ height: `${yuzde}%` }} />
                    {g.fire > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-400 rounded-b opacity-60"
                        style={{ height: `${(g.fire / maks7) * 100}%` }} />
                    )}
                  </div>
                  {gunSayisi <= 14 && (
                    <span className="text-[9px] text-slate-400 text-center leading-tight whitespace-nowrap">{g.gun}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-2.5 h-2.5 rounded bg-blue-500" />Üretim</span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-2.5 h-2.5 rounded bg-red-400 opacity-70" />Fire</span>
          </div>
        </div>

        {/* Vardiya bazlı üretim */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock size={14} className="text-violet-500" /> Vardiya Bazlı Üretim
          </h2>
          <div className="space-y-3">
            {[
              { key: "sabah", label: "1. Vardiya (08:15–18:00)", renk: "bg-blue-500"   },
              { key: "oglen", label: "2. Vardiya (18:00–02:00)", renk: "bg-violet-500" },
              { key: "gece",  label: "Gece Vardiyası",           renk: "bg-indigo-600" },
              { key: "belirsiz", label: "Belirsiz",              renk: "bg-slate-400"  },
            ].filter(v => vardiyaMap[v.key as keyof typeof vardiyaMap] > 0).map(v => {
              const deger = vardiyaMap[v.key as keyof typeof vardiyaMap];
              const oran  = aralikIE.length > 0 ? ((deger / (topUretim || 1)) * 100).toFixed(1) : "0";
              return (
                <div key={v.key} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-slate-600 truncate">{v.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3">
                    <div className={`h-3 rounded-full ${v.renk}`}
                      style={{ width: `${(deger / maxVardiya) * 100}%` }} />
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs font-semibold text-slate-700">{deger.toLocaleString("tr-TR")}</span>
                    <span className="text-[10px] text-slate-400 ml-1">%{oran}</span>
                  </div>
                </div>
              );
            })}
            {topUretim === 0 && <p className="text-slate-400 text-sm text-center py-4">Henüz veri yok</p>}
          </div>
        </div>
      </div>

      {/* Grafik satırı 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ürüne göre üretim */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-blue-500" /> Ürüne Göre Üretim (Top 6)
          </h2>
          {topUrunler.length === 0
            ? <p className="text-slate-400 text-sm text-center py-4">Henüz veri yok</p>
            : <div className="space-y-2.5">
                {topUrunler.map(([ad, v]) => (
                  <Bar key={ad} etiket={ad} deger={v.uretim} maks={topUrunler[0][1].uretim}
                    renk="bg-blue-500"
                    alt={v.fire > 0 ? `fire: ${v.fire}` : undefined} />
                ))}
              </div>}
        </div>

        {/* Ürüne göre fire oranı */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4">
            Ürüne Göre Fire Oranı (En Yüksek)
          </h2>
          {urunFireSirali.length === 0
            ? <p className="text-slate-400 text-sm text-center py-4">Henüz veri yok</p>
            : <div className="space-y-2.5">
                {urunFireSirali.map(({ ad, oran, toplam }) => (
                  <div key={ad} className="flex items-center gap-3">
                    <span className="w-28 text-xs text-slate-600 truncate text-right">{ad}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3">
                      <div className={`h-3 rounded-full ${oran > 10 ? "bg-red-500" : oran > 5 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, oran * 4)}%` }} />
                    </div>
                    <div className="w-20 text-right">
                      <span className={`text-xs font-semibold ${oran > 10 ? "text-red-600" : oran > 5 ? "text-amber-600" : "text-emerald-600"}`}>
                        %{oran.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{toplam.toLocaleString("tr-TR")} ürt.</span>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      </div>

      {/* Grafik satırı 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Duruş neden dağılımı */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <Cpu size={14} className="text-orange-500" /> Duruş Neden Dağılımı
          </h2>
          {toplamDurusDk === 0
            ? <div className="flex items-center gap-2 text-emerald-600 text-sm py-4"><CheckCircle2 size={16} /> Bu dönemde duruş kaydı yok</div>
            : <div className="space-y-2.5">
                {Object.entries(durusMap).filter(([, dk]) => dk > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([neden, dk]) => (
                    <div key={neden} className="flex items-center gap-3">
                      <span className="w-32 text-xs text-slate-600">{NEDEN_ETIKET[neden] ?? neden}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3">
                        <div className={`h-3 rounded-full ${NEDEN_RENK[neden] ?? "bg-slate-400"}`}
                          style={{ width: `${(dk / toplamDurusDk) * 100}%` }} />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-xs font-semibold text-slate-700">{hhmm(dk)}</span>
                        <span className="text-[10px] text-slate-400 ml-1">%{((dk / toplamDurusDk) * 100).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                  <span className="text-slate-500">Toplam duruş</span>
                  <span className="font-semibold text-orange-600">{hhmm(toplamDurusDk)}</span>
                </div>
              </div>}
        </div>

        {/* Kalite kontrol trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" /> Kalite Kontrol Sonuçları (7 Gün)
          </h2>
          <div className="space-y-2">
            {kaliteTrend.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 text-xs text-slate-500 text-center">{g.gun}</span>
                {g.toplam === 0
                  ? <div className="flex-1 bg-slate-50 rounded h-6 flex items-center px-2"><span className="text-[10px] text-slate-300">Kontrol yok</span></div>
                  : <div className="flex-1 flex rounded overflow-hidden h-6">
                      <div className="bg-emerald-500 flex items-center justify-center text-[10px] text-white font-medium"
                        style={{ width: `${(g.gecti / g.toplam) * 100}%`, minWidth: g.gecti > 0 ? 28 : 0 }}>
                        {g.gecti > 0 ? g.gecti : ""}
                      </div>
                      <div className="bg-red-400 flex items-center justify-center text-[10px] text-white font-medium"
                        style={{ width: `${((g.toplam - g.gecti) / g.toplam) * 100}%`, minWidth: (g.toplam - g.gecti) > 0 ? 28 : 0 }}>
                        {g.toplam - g.gecti > 0 ? g.toplam - g.gecti : ""}
                      </div>
                    </div>}
                <span className="text-[10px] text-slate-400 w-8 text-right">{g.toplam > 0 ? `${Math.round((g.gecti/g.toplam)*100)}%` : ""}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-2.5 h-2.5 rounded bg-emerald-500" />Geçti</span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-2.5 h-2.5 rounded bg-red-400" />Kaldı</span>
          </div>
        </div>
      </div>

      {/* Makina bazlı analiz */}
      {makinaMap.size > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <Cpu size={14} className="text-blue-500" /> Makina Bazlı Üretim & Fire Analizi
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Makina", "Üretim", "Fire Adet", "Fire Oranı", "Net Üretim", "Operasyon Süresi"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-slate-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...makinaMap.entries()].sort((a, b) => b[1].uretim - a[1].uretim).map(([no, v]) => {
                  const fireO = v.uretim > 0 ? (v.fire / v.uretim) * 100 : 0;
                  const makOp = oplar.filter(o => o.makinaNo === no && o.bitis && new Date(o.baslangic) >= yeniBaslangic);
                  const makOpDk = makOp.reduce((t, o) => t + Math.round((new Date(o.bitis!).getTime() - new Date(o.baslangic).getTime()) / 60000), 0);
                  const makInfo = makinalar.find(m => m.makinaNo === no);
                  return (
                    <tr key={no} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-700">
                        {no}{makInfo ? <span className="text-slate-400 font-normal ml-1">— {makInfo.makinaAdi}</span> : ""}
                      </td>
                      <td className="px-3 py-2.5 text-blue-600 font-semibold">{v.uretim.toLocaleString("tr-TR")}</td>
                      <td className="px-3 py-2.5 text-slate-600">{v.fire.toLocaleString("tr-TR")}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${fireO > 10 ? "bg-red-100 text-red-600" : fireO > 5 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                          %{fireO.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{(v.uretim - v.fire).toLocaleString("tr-TR")}</td>
                      <td className="px-3 py-2.5 text-slate-500">{makOpDk > 0 ? hhmm(makOpDk) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alt bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Stok uyarı */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
            <Package size={14} /> Stok Durumu
          </h2>
          <div className="space-y-1.5">
            {sifirStok.length === 0 && dusukStok.length === 0
              ? <div className="flex items-center gap-2 text-emerald-600 text-sm"><CheckCircle2 size={16} /> Tüm stoklar yeterli</div>
              : <>
                  {sifirStok.slice(0, 5).map(m => (
                    <div key={m.id} className="flex justify-between text-xs bg-red-50 rounded-lg px-3 py-1.5">
                      <span className="text-slate-700 truncate">{m.malzemeAdi}</span>
                      <span className="text-red-600 font-bold ml-2 flex-shrink-0">Sıfır</span>
                    </div>
                  ))}
                  {dusukStok.slice(0, 5).map(m => (
                    <div key={m.id} className="flex justify-between text-xs bg-amber-50 rounded-lg px-3 py-1.5">
                      <span className="text-slate-700 truncate">{m.malzemeAdi}</span>
                      <span className="text-amber-600 font-semibold ml-2 flex-shrink-0">{m.stokMiktari} {m.birim}</span>
                    </div>
                  ))}
                </>}
            <div className="pt-1 text-xs text-slate-400 text-right">{malzemeler.length} toplam malzeme</div>
          </div>
        </div>

        {/* Fatura özeti */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText size={14} /> Fatura & Ciro
          </h2>
          <div className="space-y-2">
            {[
              { label: "Kesilen Fatura",  deger: aralikFat.length,  renk: "text-emerald-600"  },
              { label: "Taslak",          deger: taslakFatura,       renk: "text-slate-500"   },
              { label: `Son ${aralik}g Ciro`, deger: toplamCiro.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺", renk: "text-violet-700" },
              { label: "Önceki Dönem",    deger: eskiCiro.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺",  renk: "text-slate-500" },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-b-0">
                <span className="text-slate-500 text-xs">{r.label}</span>
                <span className={`text-xs font-semibold ${r.renk}`}>{r.deger}</span>
              </div>
            ))}
          </div>
          {eskiCiro > 0 && (
            <div className={`mt-2 pt-2 border-t border-slate-100 text-xs flex items-center gap-1 ${toplamCiro >= eskiCiro ? "text-emerald-600" : "text-red-500"}`}>
              {toplamCiro >= eskiCiro ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              Önceki döneme göre {Math.abs(((toplamCiro - eskiCiro) / eskiCiro) * 100).toFixed(1)}%
              {toplamCiro >= eskiCiro ? " artış" : " düşüş"}
            </div>
          )}
        </div>

        {/* Proje özeti */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
            <FolderKanban size={14} /> Proje & Personel
          </h2>
          <div className="space-y-1.5">
            {([
              { label: "Planlama",    deger: projeler.filter(p => p.durum === "planlama").length,   renk: "bg-slate-400"   },
              { label: "Aktif",       deger: aktifProje,                                            renk: "bg-blue-500"    },
              { label: "Tamamlandı",  deger: projeler.filter(p => p.durum === "tamamlandi").length, renk: "bg-emerald-500" },
              { label: "İptal",       deger: projeler.filter(p => p.durum === "iptal").length,      renk: "bg-red-400"     },
              { label: "Gecikmiş",    deger: gecikmisPrj,                                           renk: "bg-red-600"     },
            ] as const).map(r => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${r.renk}`} />
                <span className="text-slate-500 flex-1">{r.label}</span>
                <span className="font-semibold text-slate-700">{r.deger}</span>
              </div>
            ))}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
              <Users size={12} className="text-teal-500" />
              <span className="text-slate-500">{aktifPersonel} aktif</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">{personel.length} toplam personel</span>
            </div>
          </div>
        </div>
      </div>

    </PageLayout>
  );
}
