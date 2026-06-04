"use client";

import {
  apiGetIsEmirleri, apiGetDurus, apiGetOperasyonlar, apiGetMakinalar,
  apiGetMalzemeler, apiGetKalite, apiGetFaturalar, apiGetProjeler,
} from "@/lib/api";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { BarChart2, AlertTriangle, CheckCircle2, TrendingUp, Package, FileText, FolderKanban } from "lucide-react";
import type { IsEmri, Durus, Operasyon, Malzeme, KaliteKontrol, Fatura, Proje } from "@/data/types";

function BarSatir({ etiket, deger, maks, renk }: { etiket: string; deger: number; maks: number; renk: string }) {
  const yuzde = maks > 0 ? Math.round((deger / maks) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs text-slate-500 truncate text-right">{etiket}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all ${renk}`} style={{ width: `${yuzde}%` }}/>
      </div>
      <span className="w-14 text-xs font-semibold text-slate-700 text-right">{deger.toLocaleString("tr-TR")}</span>
    </div>
  );
}

function KpiKart({ label, deger, renk, border, alt }: { label: string; deger: string | number; renk: string; border: string; alt?: string }) {
  return (
    <div className={`bg-white border ${border} rounded-xl p-4 shadow-sm`}>
      <p className="text-slate-500 text-xs uppercase tracking-wide">{label}</p>
      <p className={`${renk} text-2xl font-bold mt-1`}>{deger}</p>
      {alt && <p className="text-slate-400 text-xs mt-0.5">{alt}</p>}
    </div>
  );
}

export default function RaporlarPage() {
  const [isEmirleri,  setIsEmirleri]  = useState<IsEmri[]>([]);
  const [duruslar,    setDuruslar]    = useState<Durus[]>([]);
  const [oplar,       setOplar]       = useState<Operasyon[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [makinalar,   setMakinalar]   = useState<any[]>([]);
  const [malzemeler,  setMalzemeler]  = useState<Malzeme[]>([]);
  const [kalite,      setKalite]      = useState<KaliteKontrol[]>([]);
  const [faturalar,   setFaturalar]   = useState<Fatura[]>([]);
  const [projeler,    setProjeler]    = useState<Proje[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      apiGetIsEmirleri(), apiGetDurus(), apiGetOperasyonlar(), apiGetMakinalar(),
      apiGetMalzemeler(), apiGetKalite(), apiGetFaturalar(), apiGetProjeler(),
    ]).then(([ie, dur, op, mak, mlz, kal, fat, prj]) => {
      setIsEmirleri(ie); setDuruslar(dur as Durus[]); setOplar(op as Operasyon[]); setMakinalar(mak as unknown[]);
      setMalzemeler(mlz as Malzeme[]); setKalite(kal as KaliteKontrol[]);
      setFaturalar(fat as Fatura[]); setProjeler(prj as Proje[]);
      setLoading(false);
    });
  }, []);

  const toplamUretim = isEmirleri.reduce((t, k) => t + k.uretimAdedi, 0);
  const toplamFire   = isEmirleri.reduce((t, k) => t + k.fireAdedi, 0);
  const fireOrani    = toplamUretim > 0 ? ((toplamFire / toplamUretim) * 100).toFixed(1) : "0.0";

  const urunMap = new Map<string, number>();
  isEmirleri.forEach(k => urunMap.set(k.urunAdi, (urunMap.get(k.urunAdi) || 0) + k.uretimAdedi));
  const topUrunler = [...urunMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const makinaFireMap = new Map<string, { uretim: number; fire: number }>();
  isEmirleri.filter(k => k.makinaNo).forEach(k => {
    const m = makinaFireMap.get(k.makinaNo) ?? { uretim: 0, fire: 0 };
    makinaFireMap.set(k.makinaNo, { uretim: m.uretim + k.uretimAdedi, fire: m.fire + k.fireAdedi });
  });
  const makinaFire = [...makinaFireMap.entries()]
    .map(([no, v]) => ({ no, oran: v.uretim > 0 ? (v.fire / v.uretim) * 100 : 0 }))
    .sort((a, b) => b.oran - a.oran).slice(0, 5);

  const bugun = new Date();
  const sonYediGun = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bugun); d.setDate(d.getDate() - (6 - i));
    const ymd = d.toISOString().split("T")[0];
    return { gun: d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }), uretim: isEmirleri.filter(k => k.tarih === ymd).reduce((t, k) => t + k.uretimAdedi, 0) };
  });
  const maksSon7 = Math.max(...sonYediGun.map(g => g.uretim), 1);

  const toplamDurusDk = duruslar.reduce((t, d) => t + Math.max(0, Math.round((new Date(d.bitisTarihi).getTime() - new Date(d.baslangicTarihi).getTime()) / 60000)), 0);
  const toplamOpDk    = oplar.filter(o => o.bitis).reduce((t, o) => t + Math.round((new Date(o.bitis!).getTime() - new Date(o.baslangic).getTime()) / 60000), 0);

  const kaliteGecti = kalite.filter(k => k.sonuc === "gecti").length;
  const kaliteKaldi = kalite.filter(k => k.sonuc === "kaldi").length;
  const kaliteOrani = kalite.length > 0 ? ((kaliteGecti / kalite.length) * 100).toFixed(1) : "—";

  const dusukStok   = malzemeler.filter(m => m.stokMiktari > 0 && m.stokMiktari <= 10);
  const sifirStok   = malzemeler.filter(m => m.stokMiktari === 0);

  const toplamCiro   = faturalar.filter(f => f.durum === "kesildi").reduce((t, f) => t + f.genelToplam, 0);
  const faturaAdet   = faturalar.filter(f => f.durum === "kesildi").length;
  const taslakFatura = faturalar.filter(f => f.durum === "taslak").length;

  const aktifProje  = projeler.filter(p => p.durum === "aktif").length;
  const gecikmisPrj = projeler.filter(p => p.durum === "aktif" && p.bitisTarihi && new Date(p.bitisTarihi) < bugun).length;

  if (loading) return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-100"><Sidebar/>
        <main className="flex-1 md:ml-60 p-6 flex items-center justify-center">
          <p className="text-slate-500 text-sm">Yükleniyor…</p>
        </main>
      </div>
    </AuthGuard>
  );

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar/>
      <main className="flex-1 md:ml-60 p-4 sm:p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold flex items-center gap-2">
              <BarChart2 size={22} className="text-blue-500"/> Raporlar
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* Kritik Uyarılar */}
        {(sifirStok.length > 0 || dusukStok.length > 0 || gecikmisPrj > 0 || taslakFatura > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-amber-700 font-semibold text-sm flex items-center gap-2"><AlertTriangle size={16}/> Kritik Uyarılar</p>
            {sifirStok.length > 0 && <p className="text-amber-600 text-xs">🔴 {sifirStok.length} malzeme stokta sıfır: {sifirStok.slice(0,3).map((m: Malzeme) => m.malzemeAdi).join(", ")}</p>}
            {dusukStok.length > 0 && <p className="text-amber-600 text-xs">🟡 {dusukStok.length} malzeme düşük stokta (≤10)</p>}
            {gecikmisPrj > 0      && <p className="text-amber-600 text-xs">🔴 {gecikmisPrj} aktif proje bitiş tarihini geçti</p>}
            {taslakFatura > 0     && <p className="text-amber-600 text-xs">🟡 {taslakFatura} taslak fatura kesilmeyi bekliyor</p>}
          </div>
        )}

        {/* Üretim KPI */}
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5"><TrendingUp size={14}/> Üretim</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiKart label="Toplam Üretim"  deger={toplamUretim.toLocaleString("tr-TR")} renk="text-blue-600"   border="border-blue-100"/>
            <KpiKart label="Toplam Fire"    deger={toplamFire.toLocaleString("tr-TR")}   renk="text-red-500"    border="border-red-100"/>
            <KpiKart label="Fire Oranı"     deger={`%${fireOrani}`} renk={parseFloat(fireOrani)>10?"text-red-500":"text-emerald-600"} border={parseFloat(fireOrani)>10?"border-red-100":"border-emerald-100"}/>
            <KpiKart label="İş Emri"        deger={isEmirleri.length}                    renk="text-violet-600" border="border-violet-100"/>
          </div>
        </div>

        {/* Diğer KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiKart label="Kalite Geçme"   deger={kalite.length>0?`%${kaliteOrani}`:"—"} renk={parseFloat(kaliteOrani)>=90?"text-emerald-600":"text-orange-500"} border="border-orange-100" alt={`${kaliteGecti} geçti / ${kaliteKaldi} kaldı`}/>
          <KpiKart label="Malzeme"        deger={malzemeler.length}                      renk="text-teal-600"   border="border-teal-100"   alt={`${sifirStok.length} stoksuz`}/>
          <KpiKart label="Toplam Ciro"    deger={toplamCiro.toLocaleString("tr-TR",{maximumFractionDigits:0})+" ₺"} renk="text-emerald-600" border="border-emerald-100" alt={`${faturaAdet} fatura`}/>
          <KpiKart label="Aktif Proje"    deger={aktifProje} renk={gecikmisPrj>0?"text-red-500":"text-blue-600"} border={gecikmisPrj>0?"border-red-100":"border-blue-100"} alt={gecikmisPrj>0?`${gecikmisPrj} gecikmiş`:"Zamanında"}/>
        </div>

        {/* Operasyon + Duruş */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Operasyon Süresi</p>
            <p className="text-blue-600 text-xl font-bold mt-1">{toplamOpDk>=60?`${Math.floor(toplamOpDk/60)}s ${toplamOpDk%60}dk`:`${toplamOpDk}dk`}</p>
            <p className="text-slate-400 text-xs mt-0.5">{oplar.filter(o=>o.bitis).length} tamamlandı</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Duruş Süresi</p>
            <p className="text-orange-600 text-xl font-bold mt-1">{toplamDurusDk>=60?`${Math.floor(toplamDurusDk/60)}s ${toplamDurusDk%60}dk`:`${toplamDurusDk}dk`}</p>
            <p className="text-slate-400 text-xs mt-0.5">{duruslar.length} kayıt</p>
          </div>
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4 flex items-center gap-2"><TrendingUp size={14}/> Ürüne Göre Üretim (Top 5)</h2>
            {topUrunler.length === 0
              ? <p className="text-slate-400 text-sm text-center py-4">Henüz veri yok</p>
              : <div className="space-y-3">{topUrunler.map(([u,a])=><BarSatir key={u} etiket={u} deger={a} maks={topUrunler[0][1]} renk="bg-blue-500"/>)}</div>}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4">Makinaya Göre Fire Oranı</h2>
            {makinaFire.length === 0
              ? <p className="text-slate-400 text-sm text-center py-4">Henüz veri yok</p>
              : <div className="space-y-3">{makinaFire.map(({no,oran})=>(
                  <div key={no} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-slate-500 truncate text-right">{no}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${oran>10?"bg-red-500":"bg-emerald-500"}`} style={{width:`${Math.min(100,oran*5)}%`}}/>
                    </div>
                    <span className={`w-14 text-xs font-semibold text-right ${oran>10?"text-red-600":"text-emerald-600"}`}>%{oran.toFixed(1)}</span>
                  </div>
                ))}</div>}
          </div>
        </div>

        {/* Son 7 gün trendi */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-4">Son 7 Gün Üretim Trendi</h2>
          <div className="flex items-end gap-2 h-28">
            {sonYediGun.map(g => {
              const yuzde = maksSon7 > 0 ? (g.uretim / maksSon7) * 100 : 0;
              return (
                <div key={g.gun} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-600">{g.uretim > 0 ? g.uretim : ""}</span>
                  <div className="w-full bg-slate-100 rounded-t-md relative" style={{height:"72px"}}>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-md" style={{height:`${yuzde}%`}}/>
                  </div>
                  <span className="text-[10px] text-slate-400 text-center leading-tight">{g.gun}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alt 3 kutu: Malzeme + Fatura + Proje */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-3 flex items-center gap-2"><Package size={14}/> Düşük / Sıfır Stok</h2>
            {dusukStok.length === 0 && sifirStok.length === 0
              ? <div className="flex items-center gap-2 text-emerald-600 text-sm"><CheckCircle2 size={16}/> Tüm stoklar yeterli</div>
              : <div className="space-y-1.5">
                  {sifirStok.slice(0,4).map((m: Malzeme)=><div key={m.id} className="flex justify-between text-xs"><span className="text-slate-700 truncate">{m.malzemeAdi}</span><span className="text-red-500 font-bold ml-2 flex-shrink-0">Sıfır</span></div>)}
                  {dusukStok.slice(0,4).map((m: Malzeme)=><div key={m.id} className="flex justify-between text-xs"><span className="text-slate-700 truncate">{m.malzemeAdi}</span><span className="text-orange-500 font-semibold ml-2 flex-shrink-0">{m.stokMiktari} {m.birim}</span></div>)}
                </div>}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-3 flex items-center gap-2"><FileText size={14}/> Fatura Özeti</h2>
            <div className="space-y-2">
              {[
                {label:"Kesildi",  deger:faturaAdet,  renk:"text-emerald-600"},
                {label:"Taslak",   deger:taslakFatura,renk:"text-slate-500"},
                {label:"Toplam Ciro",deger:toplamCiro.toLocaleString("tr-TR",{maximumFractionDigits:0})+" ₺",renk:"text-violet-700"},
              ].map(r=>(
                <div key={r.label} className="flex justify-between py-1 border-b border-slate-50 last:border-b-0">
                  <span className="text-slate-500 text-xs">{r.label}</span>
                  <span className={`text-xs font-semibold ${r.renk}`}>{r.deger}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-slate-700 font-semibold text-xs uppercase tracking-wide mb-3 flex items-center gap-2"><FolderKanban size={14}/> Proje Özeti</h2>
            <div className="space-y-2">
              {[
                {label:"Planlama",  deger:projeler.filter(p=>p.durum==="planlama").length,  renk:"text-slate-500"},
                {label:"Aktif",     deger:aktifProje,                                       renk:"text-blue-600"},
                {label:"Tamamlandı",deger:projeler.filter(p=>p.durum==="tamamlandi").length,renk:"text-emerald-600"},
                {label:"Gecikmiş",  deger:gecikmisPrj, renk:gecikmisPrj>0?"text-red-500":"text-slate-300"},
              ].map(r=>(
                <div key={r.label} className="flex justify-between py-1 border-b border-slate-50 last:border-b-0">
                  <span className="text-slate-500 text-xs">{r.label}</span>
                  <span className={`text-xs font-semibold ${r.renk}`}>{r.deger}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
    </AuthGuard>
  );
}
