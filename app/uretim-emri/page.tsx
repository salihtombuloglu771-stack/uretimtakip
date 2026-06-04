"use client";


import { apiAddIsEmri, apiGetIsEmirleri } from "@/lib/api";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import IsEmriForm from "@/components/IsEmriForm";

import { FilePlus, CheckCircle } from "lucide-react";
import type { IsEmri, YeniIsEmri } from "@/data/types";

export default function UretimEmriPage() {
  const [isEmriListesi, setIsEmriListesi] = useState<IsEmri[]>([]);
  const [sonKayit, setSonKayit] = useState<string | null>(null);

  useEffect(() => {
    apiGetIsEmirleri().then(setIsEmriListesi);
  }, []);

  async function handleKaydet(yeni: YeniIsEmri) {
    const { id } = await apiAddIsEmri(yeni);
    const kayit: IsEmri = { ...yeni, id };
    setIsEmriListesi((p) => [...p, kayit]);
    setSonKayit(yeni.isEmriNo);
    setTimeout(() => setSonKayit(null), 3000);
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 md:ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold flex items-center gap-2">
              <FilePlus size={22} className="text-blue-500" /> Üretim Emri Gir
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Yeni üretim emrini buradan kaydet</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm">
              {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">Toplam kayıt: {isEmriListesi.length}</p>
          </div>
        </div>

        {sonKayit && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
            <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-700 text-sm font-medium">
              <span className="font-bold">{sonKayit}</span> numaralı iş emri başarıyla kaydedildi.
            </p>
          </div>
        )}

        <IsEmriForm onKaydet={handleKaydet} />

        {isEmriListesi.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-slate-700 font-semibold text-sm mb-3">Son Kayıtlar</h3>
            <div className="space-y-2">
              {[...isEmriListesi].reverse().slice(0, 5).map((k) => (
                <div key={k.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 font-medium text-sm">{k.isEmriNo}</span>
                    <span className="text-slate-600 text-sm">{k.urunAdi}</span>
                    {k.makinaNo && <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{k.makinaNo}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-emerald-600 font-medium">{k.uretimAdedi.toLocaleString("tr-TR")} adet</span>
                    <span className="text-slate-400 text-xs">{new Date(k.tarih).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
