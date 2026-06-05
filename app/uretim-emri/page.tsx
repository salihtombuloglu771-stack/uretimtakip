"use client";


import { apiAddIsEmri, apiGetIsEmirleri } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import { useState, useEffect } from "react";
import IsEmriForm from "@/components/IsEmriForm";

import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
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
    <PageLayout baslik="Üretim Emri Gir" altyazi="Yeni üretim emrini buradan kaydet">

        {sonKayit && (
          <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
              <p className="text-emerald-700 text-sm font-medium">
                <span className="font-bold">{sonKayit}</span> numaralı iş emri kaydedildi.
              </p>
            </div>
            <Link href="/is-emirleri"
              className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 text-sm font-semibold whitespace-nowrap">
              Listeyi gör <ArrowRight size={14}/>
            </Link>
          </div>
        )}

        <IsEmriForm onKaydet={handleKaydet} />

        {isEmriListesi.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-700 font-semibold text-sm">Son Kayıtlar</h3>
              <Link href="/is-emirleri" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium">
                Tümünü gör <ArrowRight size={12}/>
              </Link>
            </div>
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
    </PageLayout>
  );
}
