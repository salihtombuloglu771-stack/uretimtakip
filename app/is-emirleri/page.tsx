"use client";


import { apiDeleteIsEmri, apiGetIsEmirleri } from "@/lib/api";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/StatsCards";
import IsEmriTablosu from "@/components/IsEmriTablosu";
import AuthGuard from "@/components/AuthGuard";

import type { IsEmri } from "@/data/types";

export default function IsEmirleriSayfasi() {
  const [isEmriListesi, setIsEmriListesi] = useState<IsEmri[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetIsEmirleri().then((data) => { setIsEmriListesi(data); setLoading(false); });
  }, []);

  async function handleSil(id: string) {
    await apiDeleteIsEmri(id);
    setIsEmriListesi((p) => p.filter((k) => k.id !== id));
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">İş Emirleri</h1>
            <p className="text-slate-500 text-sm mt-0.5">Tüm iş emirleri toplu görünüm</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <StatsCards isEmriListesi={isEmriListesi} />

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm shadow-sm">Yükleniyor…</div>
        ) : (
          <IsEmriTablosu isEmriListesi={isEmriListesi} onSil={handleSil} />
        )}

      </main>
    </div>
    </AuthGuard>
  );
}
