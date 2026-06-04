// Server component — Google bu dosyayı JS olmadan okur
import type { Metadata } from "next";
import LandingClient from "./_LandingClient";

export const metadata: Metadata = {
  title: "NexPlan ERP — Üretim Takip ve Planlama Yazılımı",
  description:
    "NexPlan, üretim firmaları için geliştirilmiş bulut tabanlı ERP yazılımıdır. " +
    "İş emri yönetimi, makina takibi, kalite kontrol, stok ve personel yönetimini " +
    "tek ekranda kolayca gerçekleştirin. 30 gün ücretsiz deneyin.",
  alternates: {
    canonical: "https://nexplan.net",
  },
  openGraph: {
    title: "NexPlan ERP — Üretim Takip Yazılımı",
    description:
      "Üretim firmalarına özel bulut ERP. İş emri, makina, kalite, stok tek sistemde. 30 gün ücretsiz.",
    url: "https://nexplan.net",
    type: "website",
  },
};

export default function Page() {
  return <LandingClient />;
}
