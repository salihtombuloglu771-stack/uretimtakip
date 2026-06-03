"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { Play, StopCircle, ClipboardList } from "lucide-react";
import type { IsEmri, Operasyon } from "@/data/types";
import { getIsEmirleri, getOperasyonlar, addOperasyon, updateOperasyonBitis } from "@/lib/db";

function sureFmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sn = s % 60;
  if (h > 0) return `${h}s ${m}dk ${sn}sn`;
  if (m > 0) return `${m}dk ${sn}sn`;
  return `${sn}sn`;
}

export default function OperasyonTakibiPage() {
  const [isEmriListesi, setIsEmriListesi] = useState<IsEmri[]>([]);
  const [operasyonlar,  setOperasyonlar]  = useState<Operasyon[]>([]);
  const [simdi,         setSimdi]         = useState(() => Date.now());
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getIsEmirleri(), getOperasyonlar()]).then(([isData, opData]) => {
      setIsEmriListesi(isData);
      setOperasyonlar(opData);
      setLoading(false);
    });
  }, []);

  // Aktif operasyon varsa her saniye re-render tetikle
  useEffect(() => {
    const interval = setInterval(() => setSimdi(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleBaslat(kayit: IsEmri) {
    if (operasyonlar.some((o) => o.isEmriId === kayit.id && !o.bitis)) return;
    const yeni: Omit<Operasyon, "id"> = {
      isEmriId:  kayit.id,
      isEmriNo:  kayit.isEmriNo,
      urunAdi:   kayit.urunAdi,
      makinaNo:  kayit.makinaNo || undefined,
      baslangic: new Date().toISOString(),
    };
    const id = await addOperasyon(yeni);
    setOperasyonlar((p) => [...p, { ...yeni, id }]);
  }

  async function handleDurdur(isEmriId: string) {
    const aktif = operasyonlar.find((o) => o.isEmriId === isEmriId && !o.bitis);
    if (!aktif) return;
    const bitis = new Date().toISOString();
    await updateOperasyonBitis(aktif.id, bitis);
    setOperasyonlar((p) =>
      p.map((o) => o.id === aktif.id ? { ...o, bitis } : o)
    );
  }

  const aktifSayi     = operasyonlar.filter((o) => !o.bitis).length;
  const tamamlananlar = [...operasyonlar].filter((o) => !!o.bitis).reverse();

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
            <h1 className="text-slate-800 text-xl font-bold">Operasyon Takibi</h1>
            <p className="text-slate-500 text-sm mt-0.5">İş emirlerinde operasyon başlat / durdur, süreyi takip et</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Aktif Operasyon</p>
            <p className="text-emerald-600 text-3xl font-bold mt-1">{aktifSayi}</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Tamamlanan</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{tamamlananlar.length}</p>
          </div>
        </div>

        {/* İş emirleri tablosu */}
        {isEmriListesi.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
            <ClipboardList size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">Henüz iş emri kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-500" /> İş Emirleri
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["İş Emri No", "Ürün", "Makina", "Durum", "Geçen Süre", "İşlem"].map((b) => (
                      <th key={b} className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...isEmriListesi].reverse().map((kayit, i) => {
                    const aktif   = operasyonlar.find((o) => o.isEmriId === kayit.id && !o.bitis);
                    const gecenMs = aktif ? simdi - new Date(aktif.baslangic).getTime() : 0;
                    return (
                      <tr key={kayit.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        <td className="px-4 py-3 text-blue-600 font-medium">{kayit.isEmriNo}</td>
                        <td className="px-4 py-3 text-slate-800">{kayit.urunAdi}</td>
                        <td className="px-4 py-3 text-slate-600">{kayit.makinaNo || "—"}</td>
                        <td className="px-4 py-3">
                          {aktif ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                              Aktif
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-slate-500 bg-slate-100">Bekliyor</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 text-sm">
                          {aktif ? sureFmt(gecenMs) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {aktif ? (
                            <button onClick={() => handleDurdur(kayit.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
                              <StopCircle size={12} /> Durdur
                            </button>
                          ) : (
                            <button onClick={() => handleBaslat(kayit)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors">
                              <Play size={12} /> Başlat
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tamamlanan operasyonlar */}
        {tamamlananlar.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold text-base">Tamamlanan Operasyonlar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["İş Emri No", "Ürün", "Makina", "Başlangıç", "Bitiş", "Toplam Süre"].map((b) => (
                      <th key={b} className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tamamlananlar.map((op, i) => {
                    const ms = op.bitis
                      ? new Date(op.bitis).getTime() - new Date(op.baslangic).getTime()
                      : 0;
                    return (
                      <tr key={op.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        <td className="px-4 py-3 text-blue-600 font-medium">{op.isEmriNo}</td>
                        <td className="px-4 py-3 text-slate-800">{op.urunAdi}</td>
                        <td className="px-4 py-3 text-slate-600">{op.makinaNo || "—"}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(op.baslangic).toLocaleString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {op.bitis ? new Date(op.bitis).toLocaleString("tr-TR") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full text-violet-600 bg-violet-100">
                            {sureFmt(ms)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
    </AuthGuard>
  );
}
