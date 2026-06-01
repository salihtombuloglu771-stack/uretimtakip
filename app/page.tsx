"use client";

// "use client" direktifi: bu dosyanın tarayıcıda çalışacağını Next.js'e söyler.
// useState ve localStorage gibi browser API'leri yalnızca client componentlerde kullanılabilir.

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/StatsCards";
import IsEmriForm from "@/components/IsEmriForm";
import IsEmriTablosu from "@/components/IsEmriTablosu";
import AuthGuard from "@/components/AuthGuard";
import type { IsEmri, YeniIsEmri } from "@/data/types";

// localStorage'da veri saklayacağımız anahtar — sabit yapmak typo riskini önler
const DEPO_ANAHTARI = "uretim_is_emirleri";

export default function AnaSayfa() {
  const [isEmriListesi, setIsEmriListesi] = useState<IsEmri[]>([]);
  // loaded: localStorage okunduktan SONRA true olur.
  // Kaydetme effect'i bu bayrak olmadan çalışırsa, başlangıçtaki boş [] ile
  // localStorage'ı siler — sayfayı yenileyince veriler kaybolur.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const kayitliVeri = localStorage.getItem(DEPO_ANAHTARI);
    if (kayitliVeri) {
      try { setIsEmriListesi(JSON.parse(kayitliVeri)); } catch {}
    }
    setLoaded(true); // Okuma bitti, artık yazmaya izin ver
  }, []);

  useEffect(() => {
    if (!loaded) return; // Yükleme tamamlanmadan localStorage'a yazma
    localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(isEmriListesi));
  }, [isEmriListesi, loaded]);

  // Yeni iş emri ekleme fonksiyonu — formdan gelir
  function handleKaydet(yeniVeri: YeniIsEmri) {
    const yeniKayit: IsEmri = {
      ...yeniVeri,
      // crypto.randomUUID(): tarayıcıda çalışan, çakışmayan benzersiz ID üretir
      id: crypto.randomUUID(),
    };
    // Mevcut listeye ekle — spread ile yeni dizi oluştur (immutable pattern)
    setIsEmriListesi((onceki) => [...onceki, yeniKayit]);
  }

  // Kaydı sil — id eşleşmeyenleri filtrele (silinen kaydı dışarıda bırak)
  function handleSil(id: string) {
    setIsEmriListesi((onceki) => onceki.filter((kayit) => kayit.id !== id));
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Üretim takip ve iş emri yönetimi
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

        {/* Özet istatistik kartları — veriler hesaplanıp gösterilir */}
        <StatsCards isEmriListesi={isEmriListesi} />

        {/* İş emri kayıt formu */}
        <IsEmriForm onKaydet={handleKaydet} />

        {/* Tablo — tüm iş emirlerini listeler */}
        <IsEmriTablosu
          isEmriListesi={isEmriListesi}
          onSil={handleSil}
        />

      </main>
    </div>
    </AuthGuard>
  );
}
