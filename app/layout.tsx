import type { Metadata } from "next";
import "./globals.css";
import GlobalCamera from "@/components/GlobalCamera";
import MesajBildirim from "@/components/MesajBildirim";
import { ToastProvider } from "@/components/Toast";

const BASE = "https://uretimtakip-six.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "NexPlan ERP — Üretim Takip ve Planlama Yazılımı",
    template: "%s | NexPlan ERP",
  },
  description:
    "NexPlan, üretim firmaları için geliştirilmiş bulut tabanlı ERP sistemidir. İş emri, makina, kalite kontrol, stok, personel ve raporları tek ekranda yönetin.",
  keywords: [
    "üretim takip yazılımı",
    "ERP sistemi",
    "iş emri yönetimi",
    "üretim planlama",
    "kalite kontrol yazılımı",
    "makina takip",
    "stok yönetimi",
    "bulut ERP",
    "NexPlan",
    "fabrika yazılımı",
  ],
  authors: [{ name: "NexPlan" }],
  creator: "NexPlan",
  publisher: "NexPlan",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE,
    siteName: "NexPlan ERP",
    title: "NexPlan ERP — Üretim Takip ve Planlama Yazılımı",
    description:
      "Üretim firmaları için bulut tabanlı ERP. İş emri, makina, kalite, stok tek sistemde.",
    images: [
      {
        url: `${BASE}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "NexPlan ERP — Üretim Yönetim Sistemi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexPlan ERP — Üretim Takip ve Planlama Yazılımı",
    description: "Üretim firmaları için bulut tabanlı ERP sistemi.",
    images: [`${BASE}/og-image.png`],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  alternates: {
    canonical: BASE,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Crisp canlı destek widget */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.$crisp=[];window.CRISP_WEBSITE_ID="YOUR_CRISP_ID";
          (function(){var d=document;var s=d.createElement("script");
          s.src="https://client.crisp.chat/l.js";s.async=1;
          d.getElementsByTagName("head")[0].appendChild(s);})();
        `}} />
        {/* JSON-LD Yapısal Veri — Google için */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "NexPlan ERP",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: BASE,
              description:
                "Üretim firmaları için bulut tabanlı ERP ve üretim takip yazılımı. İş emri, makina, kalite kontrol, stok, personel yönetimi.",
              offers: [
                {
                  "@type": "Offer",
                  name: "Başlangıç Paketi",
                  price: "999",
                  priceCurrency: "TRY",
                  priceSpecification: { billingDuration: "P1M" },
                },
                {
                  "@type": "Offer",
                  name: "Pro Paketi",
                  price: "2499",
                  priceCurrency: "TRY",
                  priceSpecification: { billingDuration: "P1M" },
                },
              ],
              featureList: [
                "İş Emri Yönetimi",
                "Makina Takibi ve Bakım Uyarısı",
                "Kalite Kontrol",
                "Stok ve Malzeme Yönetimi",
                "Üretim Raporları",
                "Personel Yönetimi",
                "Fatura ve İrsaliye",
              ],
              inLanguage: "tr",
            }),
          }}
        />
      </head>
      <body>
        <ToastProvider>
          {children}
          <GlobalCamera />
          <MesajBildirim />
        </ToastProvider>
      </body>
    </html>
  );
}
