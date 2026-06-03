// Next.js'te layout.tsx her sayfayı sarar — <html> ve <body> burada tanımlanır.
// globals.css burada import edilir, böylece tüm sayfalara uygulanır.

import type { Metadata } from "next";
import "./globals.css";
import GlobalCamera from "@/components/GlobalCamera";

export const metadata: Metadata = {
  title: "NexPlan",
  description: "NexPlan — Üretim planlama ve takip ERP sistemi",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        {children}
        <GlobalCamera />
      </body>
    </html>
  );
}
