"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KokSayfa() {
  const router = useRouter();
  useEffect(() => { router.replace("/anasayfa"); }, [router]);
  return null;
}
