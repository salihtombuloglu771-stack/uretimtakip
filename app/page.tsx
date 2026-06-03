"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/StatsCards";
import IsEmriForm from "@/components/IsEmriForm";
import IsEmriTablosu from "@/components/IsEmriTablosu";
import AuthGuard from "@/components/AuthGuard";
import { getIsEmirleri, addIsEmri, deleteIsEmri, getMalzemeler } from "@/lib/db";
import { Layers } from "lucide-react";
import type { IsEmri, YeniIsEmri, Malzeme } from "@/data/types";

export default function AnaSayfa() {
  const [isEmriListesi, setIsEmriListesi] = useState<IsEmri[]>([]);
  const [malzemeler,    setMalzemeler]    = useState<Malzeme[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getIsEmirleri(), getMalzemeler()]).then(([isData, malzData]) => {
      setIsEmriListesi(isData);
      setMalzemeler(malzData);
      setLoading(false);
    });
  }, []);

  async function handleKaydet(yeni: YeniIsEmri) {
    const id = await addIsEmri(yeni);
    setIsEmriListesi((p) => [...p, { ...yeni, id }]);
  }

  async function handleSil(id: string) {
    await deleteIsEmri(id);
    setIsEmriListesi((p) => p.filter((k) => k.id !== id));
  }

  const toplamStokDeger = malzemeler.reduce((t, m) => t + m.stokMiktari * (m.birimFiyat ?? 0), 0);

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Üretim takip ve iş emri yönetimi</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <StatsCards isEmriListesi={isEmriListesi} />
        <IsEmriForm onKaydet={handleKaydet} />

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm shadow-sm">Yükleniyor…</div>
        ) : (
          <IsEmriTablosu isEmriListesi={isEmriListesi} onSil={handleSil} />
        )}

        {/* Malzeme Listesi */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
              <Layers size={18} className="text-blue-500" /> Kayıtlı Malzemeler
            </h2>
            <div className="flex items-center gap-3">
              {toplamStokDeger > 0 && (
                <span className="text-violet-700 text-xs font-semibold">
                  Toplam: {toplamStokDeger.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                </span>
              )}
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">
                {malzemeler.length} malzeme
              </span>
            </div>
          </div>

          {malzemeler.length === 0 ? (
            <div className="px-6 py-10 flex flex-col items-center gap-2">
              <Layers size={32} className="text-slate-200" />
              <p className="text-slate-400 text-sm">Henüz malzeme kaydı yok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Malzeme Kodu", "Malzeme Adı", "Birim", "Stok Miktarı", "Birim Fiyat", "Stok Değeri"].map((b) => (
                      <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {malzemeler.map((m, i) => {
                    const deger = m.stokMiktari * (m.birimFiyat ?? 0);
                    return (
                      <tr key={m.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        <td className="px-5 py-3.5 text-blue-600 font-medium">{m.malzemeKodu}</td>
                        <td className="px-5 py-3.5 text-slate-800">{m.malzemeAdi}</td>
                        <td className="px-5 py-3.5 text-slate-500">{m.birim}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            m.stokMiktari === 0
                              ? "text-red-600 bg-red-100"
                              : m.stokMiktari < 10
                              ? "text-amber-600 bg-amber-100"
                              : "text-emerald-600 bg-emerald-100"
                          }`}>
                            {m.stokMiktari.toLocaleString("tr-TR")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {m.birimFiyat != null
                            ? m.birimFiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺"
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-violet-700 font-medium">
                          {deger > 0 ? deger.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                        </td>
                      </tr>
                    );
                  })}
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
