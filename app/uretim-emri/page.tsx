"use client";

import { addIsEmri } from "@/lib/db";
import PageLayout from "@/components/PageLayout";
import IsEmriForm from "@/components/IsEmriForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import type { YeniIsEmri } from "@/data/types";

export default function UretimEmriPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [kaydediyor, setKaydediyor] = useState(false);

  async function handleKaydet(yeni: YeniIsEmri) {
    setKaydediyor(true);
    try {
      await addIsEmri(yeni);
      toast("İş emri başarıyla kaydedildi.", "basari");
      router.push("/is-emirleri");
    } catch (err) {
      console.error("Kayıt hatası:", err);
      toast("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.", "hata");
    } finally {
      setKaydediyor(false);
    }
  }

  return (
    <PageLayout baslik="Üretim Emri Gir" altyazi="Yeni üretim emrini buradan kaydet">
      <IsEmriForm onKaydet={handleKaydet} kaydediyor={kaydediyor} />
    </PageLayout>
  );
}
