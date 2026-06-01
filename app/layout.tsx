// Next.js'te layout.tsx her sayfayı sarar — <html> ve <body> burada tanımlanır.
// globals.css burada import edilir, böylece tüm sayfalara uygulanır.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Üretim Takip Portalı",
  description: "Fabrika iş emri ve üretim takip sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
