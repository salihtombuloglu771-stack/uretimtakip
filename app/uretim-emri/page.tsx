"use client";

import { apiAddIsEmri } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import IsEmriForm from "@/components/IsEmriForm";
import { useRouter } from "next/navigation";
import type { YeniIsEmri } from "@/data/types";

export default function UretimEmriPage() {
  const router = useRouter();

  async function handleKaydet(yeni: YeniIsEmri) {
    await apiAddIsEmri(yeni);
    router.push("/is-emirleri");
  }

  return (
    <PageLayout baslik="Üretim Emri Gir" altyazi="Yeni üretim emrini buradan kaydet">
      <IsEmriForm onKaydet={handleKaydet} />
    </PageLayout>
  );
}
