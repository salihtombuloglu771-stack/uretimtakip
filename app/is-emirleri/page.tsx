"use client";

// Bu sayfa tüm iş emirlerini toplu olarak gösterir.
// Kayıt ekleme formu yok — sadece okuma ve silme işlemi var.
// Veriler Dashboard ile aynı localStorage anahtarından okunur → senkron kalır.

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/StatsCards";
import IsEmriTablosu from "@/components/IsEmriTablosu";
import AuthGuard from "@/components/AuthGuard";
import type { IsEmri } from "@/data/types";

const DEPO_ANAHTARI = "uretim_is_emirleri";

export default function IsEmirleriSayfasi() {
  const [isEmriListesi, setIsEmriListesi] = useState<IsEmri[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const veri = localStorage.getItem(DEPO_ANAHTARI);
    if (veri) {
      try { setIsEmriListesi(JSON.parse(veri)); } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(isEmriListesi));
  }, [isEmriListesi, loaded]);

  function handleSil(id: string) {
    setIsEmriListesi((onceki) => onceki.filter((k) => k.id !== id));
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">İş Emirleri</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Tüm iş emirleri toplu görünüm
            </p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Özet kartlar — bu sayfada da görünsün */}
        <StatsCards isEmriListesi={isEmriListesi} />

        {/* Tam liste tablosu */}
        <IsEmriTablosu
          isEmriListesi={isEmriListesi}
          onSil={handleSil}
        />

      </main>
    </div>
    </AuthGuard>
  );
}
