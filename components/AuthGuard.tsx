"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { KullaniciRol } from "@/data/types";

export const OTURUM_ANAHTARI = "uretim_oturum";
export const ROL_ANAHTARI    = "uretim_rol";

// Diğer componentlerin rolü okuması için yardımcı fonksiyon
export function getRol(): KullaniciRol | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROL_ANAHTARI) as KullaniciRol | null;
}

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const router  = useRouter();
  const [kontrol, setKontrol] = useState(false);

  useEffect(() => {
    const oturum = localStorage.getItem(OTURUM_ANAHTARI);
    if (!oturum) {
      router.replace("/giris");
    } else {
      setKontrol(true);
    }
  }, [router]);

  if (!kontrol) return <div className="min-h-screen bg-slate-100" />;

  return <>{children}</>;
}
