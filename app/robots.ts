import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/odeme"],
        disallow: [
          "/anasayfa",
          "/is-emirleri",
          "/uretim-emri",
          "/kalite-kontrol",
          "/makinalar",
          "/malzeme",
          "/personel",
          "/kullanicilar",
          "/mesajlar",
          "/raporlar",
          "/durus-kaydi",
          "/operasyon-takibi",
          "/depo/",
          "/sabit-kiymet",
          "/fatura",
          "/projeler",
          "/urun-katalogu",
          "/api/",
        ],
      },
    ],
    sitemap: "https://uretimtakip-six.vercel.app/sitemap.xml",
  };
}
