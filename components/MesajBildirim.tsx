"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { okunmamisSayisi } from "@/lib/mesajlar";

export default function MesajBildirim() {
  const pathname    = usePathname();
  const [sayi, setSayi] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const ad = localStorage.getItem("uretim_kullanici_adi") ?? "";
    okunmamisSayisi(ad).then(setSayi);
    const id = setInterval(() => okunmamisSayisi(ad).then(setSayi), 8_000);
    return () => clearInterval(id);
  }, [pathname]);

  if (!mounted || pathname === "/giris") return null;

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
      <Link
        href="/mesajlar"
        title="Mesajlar"
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:bg-blue-50 hover:border-blue-300 transition-all"
      >
        <MessageSquare size={18} className={sayi > 0 ? "text-blue-500" : "text-slate-400"} />
        {sayi > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow">
            {sayi > 99 ? "99+" : sayi}
          </span>
        )}
      </Link>
    </div>
  );
}
