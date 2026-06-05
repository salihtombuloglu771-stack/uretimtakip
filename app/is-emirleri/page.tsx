"use client";

import { deleteIsEmri, getIsEmirleri } from "@/lib/db";
import { useState, useEffect, useCallback } from "react";
import PageLayout from "@/components/PageLayout";
import StatsCards from "@/components/StatsCards";
import IsEmriTablosu from "@/components/IsEmriTablosu";
import ConfirmModal from "@/components/ConfirmModal";
import AramaKutusu from "@/components/AramaKutusu";
import { useToast } from "@/components/Toast";
import type { IsEmri } from "@/data/types";
import { AlertCircle } from "lucide-react";

export default function IsEmirleriSayfasi() {
  const { toast } = useToast();
  const [liste,    setListe]    = useState<IsEmri[]>([]);
  const [yukluyor, setYukluyor] = useState(true);
  const [hata,     setHata]     = useState("");
  const [arama,    setArama]    = useState("");
  const [silId,    setSilId]    = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setYukluyor(true);
    setHata("");
    try {
      const data = await getIsEmirleri();
      setListe(data);
    } catch {
      setHata("Veriler yüklenemedi.");
    } finally {
      setYukluyor(false);
    }
  }, []);

  useEffect(() => { yukle(); }, [yukle]);

  async function handleSil() {
    if (!silId) return;
    try {
      await deleteIsEmri(silId);
      setListe(p => p.filter(k => k.id !== silId));
      toast("İş emri silindi.", "basari");
    } catch {
      toast("Silinemedi, tekrar deneyin.", "hata");
    } finally {
      setSilId(null);
    }
  }

  const filtreli = liste.filter(k =>
    arama === "" ||
    k.isEmriNo.toLowerCase().includes(arama.toLowerCase()) ||
    k.urunAdi.toLowerCase().includes(arama.toLowerCase()) ||
    (k.makinaNo ?? "").toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <PageLayout
      baslik="İş Emirleri"
      altyazi="Tüm iş emirleri toplu görünüm"
      yenile={yukle}
      yukleniyor={yukluyor}
      sagIcerik={
        <AramaKutusu deger={arama} onChange={setArama} placeholder="İş emri, ürün, makina…" className="w-56" />
      }
    >
      <StatsCards isEmriListesi={liste} />

      {hata && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm">
          <AlertCircle size={16} /> {hata}
        </div>
      )}

      {yukluyor ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex items-center justify-center shadow-sm">
          <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <IsEmriTablosu
          isEmriListesi={filtreli}
          onSil={id => setSilId(id)}
        />
      )}

      <ConfirmModal
        acik={silId !== null}
        mesaj="Bu iş emrini silmek istediğinizden emin misiniz?"
        onOnayla={handleSil}
        onIptal={() => setSilId(null)}
      />
    </PageLayout>
  );
}
