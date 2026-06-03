"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { BarChart2 } from "lucide-react";
import type { IsEmri, Durus, Operasyon } from "@/data/types";
import { getIsEmirleri, getDuruslar, getOperasyonlar, getMakinalar, getUrunler } from "@/lib/db";

function BarSatir({ etiket, deger, maks, renk }: { etiket: string; deger: number; maks: number; renk: string }) {
  const yuzde = maks > 0 ? Math.round((deger / maks) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-slate-500 truncate text-right">{etiket}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all ${renk}`} style={{ width: `${yuzde}%` }} />
      </div>
      <span className="w-14 text-xs font-semibold text-slate-700 text-right">{deger.toLocaleString("tr-TR")}</span>
    </div>
  );
}

export default function RaporlarPage() {
  const [isEmirleri,   setIsEmirleri]   = useState<IsEmri[]>([]);
  const [duruslar,     setDuruslar]     = useState<Durus[]>([]);
  const [oplar,        setOplar]        = useState<Operasyon[]>([]);
  const [makinaSayisi, setMakinaSayisi] = useState(0);
  const [urunSayisi,   setUrunSayisi]   = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      getIsEmirleri(),
      getDuruslar(),
      getOperasyonlar(),
      getMakinalar(),
      getUrunler(),
    ]).then(([isData, durusData, opData, makinaData, urunData]) => {
      setIsEmirleri(isData);
      setDuruslar(durusData);
      setOplar(opData);
      setMakinaSayisi(makinaData.length);
      setUrunSayisi(urunData.length);
      setLoading(false);
    });
  }, []);

  // ── İş emri hesapları ──
  const toplamUretim = isEmirleri.reduce((t, k) => t + k.uretimAdedi, 0);
  const toplamFire   = isEmirleri.reduce((t, k) => t + k.fireAdedi,   0);
  const fireOrani    = toplamUretim > 0 ? ((toplamFire / toplamUretim) * 100).toFixed(1) : "0.0";
  const stokDeger    = isEmirleri.reduce((t, k) => t + (k.uretimAdedi - k.fireAdedi) * (k.birimFiyat || 0), 0);

  // ── Ürüne göre üretim (top 5) ──
  const urunMap = new Map<string, number>();
  isEmirleri.forEach((k) => urunMap.set(k.urunAdi, (urunMap.get(k.urunAdi) || 0) + k.uretimAdedi));
  const topUrunler = [...urunMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maksUrun   = topUrunler[0]?.[1] ?? 1;

  // ── Makinaya göre fire oranı (top 5, en yüksek önce) ──
  const makinaMap = new Map<string, { uretim: number; fire: number }>();
  isEmirleri.filter((k) => k.makinaNo).forEach((k) => {
    const m = makinaMap.get(k.makinaNo) ?? { uretim: 0, fire: 0 };
    makinaMap.set(k.makinaNo, { uretim: m.uretim + k.uretimAdedi, fire: m.fire + k.fireAdedi });
  });
  const makinaFire = [...makinaMap.entries()]
    .map(([no, v]) => ({ no, oran: v.uretim > 0 ? (v.fire / v.uretim) * 100 : 0 }))
    .sort((a, b) => b.oran - a.oran)
    .slice(0, 5);

  // ── Son 7 gün üretim ──
  const bugun = new Date();
  const sonYediGun = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(d.getDate() - (6 - i));
    const ymd = d.toISOString().split("T")[0];
    const uretim = isEmirleri.filter((k) => k.tarih === ymd).reduce((t, k) => t + k.uretimAdedi, 0);
    return { gun: d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }), uretim };
  });
  const maksSon7 = Math.max(...sonYediGun.map((g) => g.uretim), 1);

  // ── Duruş özeti ──
  const toplamDurusDk = duruslar.reduce((t, d) => {
    const dk = Math.max(0, Math.round((new Date(d.bitisTarihi).getTime() - new Date(d.baslangicTarihi).getTime()) / 60000));
    return t + dk;
  }, 0);

  // ── Tamamlanan operasyon süresi ──
  const toplamOpDk = oplar
    .filter((o) => o.bitis)
    .reduce((t, o) => {
      const ms = new Date(o.bitis!).getTime() - new Date(o.baslangic).getTime();
      return t + Math.round(ms / 60000);
    }, 0);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-slate-100">
          <Sidebar />
          <main className="flex-1 ml-60 p-6 flex items-center justify-center">
            <p className="text-slate-500 text-sm">Yükleniyor…</p>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold flex items-center gap-2">
              <BarChart2 size={22} className="text-blue-500" /> Raporlar
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Üretim analizleri ve performans özeti</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* KPI kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Toplam Üretim",   deger: toplamUretim.toLocaleString("tr-TR"),                                     renk: "text-blue-600",    border: "border-blue-100"   },
            { label: "Toplam Fire",     deger: toplamFire.toLocaleString("tr-TR"),                                        renk: "text-red-500",     border: "border-red-100"    },
            { label: "Fire Oranı",      deger: `%${fireOrani}`,                                                           renk: parseFloat(fireOrani) > 10 ? "text-red-500" : "text-emerald-600", border: parseFloat(fireOrani) > 10 ? "border-red-100" : "border-emerald-100" },
            { label: "Stok Değeri",     deger: stokDeger.toLocaleString("tr-TR", { minimumFractionDigits: 0 }) + " ₺",   renk: "text-violet-600",  border: "border-violet-100" },
          ].map((k) => (
            <div key={k.label} className={`bg-white border ${k.border} rounded-xl p-5 shadow-sm`}>
              <p className="text-slate-500 text-xs uppercase tracking-wide">{k.label}</p>
              <p className={`${k.renk} text-2xl font-bold mt-1`}>{k.deger}</p>
            </div>
          ))}
        </div>

        {/* Operasyon & Duruş özet */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Operasyon Süresi</p>
            <p className="text-blue-600 text-2xl font-bold mt-1">
              {toplamOpDk >= 60 ? `${Math.floor(toplamOpDk / 60)}s ${toplamOpDk % 60}dk` : `${toplamOpDk} dk`}
            </p>
            <p className="text-slate-400 text-xs mt-1">{oplar.filter((o) => o.bitis).length} tamamlanan operasyon</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Duruş Süresi</p>
            <p className="text-orange-600 text-2xl font-bold mt-1">
              {toplamDurusDk >= 60 ? `${Math.floor(toplamDurusDk / 60)}s ${toplamDurusDk % 60}dk` : `${toplamDurusDk} dk`}
            </p>
            <p className="text-slate-400 text-xs mt-1">{duruslar.length} duruş kaydı</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Ürüne göre üretim */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-slate-800 font-semibold text-sm mb-4 uppercase tracking-wide">Ürüne Göre Üretim (Top 5)</h2>
            {topUrunler.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Veri yok</p>
            ) : (
              <div className="space-y-3">
                {topUrunler.map(([urun, adet]) => (
                  <BarSatir key={urun} etiket={urun} deger={adet} maks={maksUrun} renk="bg-blue-500" />
                ))}
              </div>
            )}
          </div>

          {/* Makinaya göre fire oranı */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-slate-800 font-semibold text-sm mb-4 uppercase tracking-wide">Makinaya Göre Fire Oranı</h2>
            {makinaFire.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Veri yok</p>
            ) : (
              <div className="space-y-3">
                {makinaFire.map(({ no, oran }) => (
                  <div key={no} className="flex items-center gap-3">
                    <span className="w-28 text-xs text-slate-500 truncate text-right">{no}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${oran > 10 ? "bg-red-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, oran * 5)}%` }}
                      />
                    </div>
                    <span className={`w-14 text-xs font-semibold text-right ${oran > 10 ? "text-red-600" : "text-emerald-600"}`}>
                      %{oran.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Son 7 gün üretim trendi */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-slate-800 font-semibold text-sm mb-5 uppercase tracking-wide">Son 7 Gün Üretim Trendi</h2>
          <div className="flex items-end gap-2 h-32">
            {sonYediGun.map((g) => {
              const yuzde = maksSon7 > 0 ? (g.uretim / maksSon7) * 100 : 0;
              return (
                <div key={g.gun} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-slate-600">{g.uretim > 0 ? g.uretim.toLocaleString("tr-TR") : ""}</span>
                  <div className="w-full bg-slate-100 rounded-t-md relative" style={{ height: "80px" }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-md transition-all"
                      style={{ height: `${yuzde}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 text-center leading-tight">{g.gun}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* İş emri sayısı ve vardiya dağılımı */}
        {isEmirleri.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-slate-800 font-semibold text-sm mb-4 uppercase tracking-wide">Vardiya Dağılımı</h2>
              <div className="space-y-3">
                {[
                  { key: "sabah", label: "1. Vardiya (08:15–18:00)", renk: "bg-blue-500" },
                  { key: "oglen", label: "2. Vardiya (18:00–02:00)", renk: "bg-violet-500" },
                ].map(({ key, label, renk }) => {
                  const sayi = isEmirleri.filter((k) => k.vardiya === key).length;
                  return (
                    <BarSatir key={key} etiket={label} deger={sayi} maks={isEmirleri.length} renk={renk} />
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-slate-800 font-semibold text-sm mb-4 uppercase tracking-wide">Genel Özet</h2>
              <div className="space-y-3">
                {[
                  { label: "Toplam İş Emri",       deger: isEmirleri.length },
                  { label: "Toplam Makina Kaydı",   deger: makinaSayisi },
                  { label: "Toplam Ürün",           deger: urunSayisi },
                  { label: "Toplam Duruş Kaydı",    deger: duruslar.length },
                ].map(({ label, deger }) => (
                  <div key={label} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-semibold text-slate-800">{deger}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
    </AuthGuard>
  );
}
