"use client";

import { useEffect, useRef, useState } from "react";

export function useCounter(hedef: number, sure = 900, gecikme = 0) {
  const [deger, setDeger] = useState(0);
  const basladi = useRef(false);

  useEffect(() => {
    if (hedef === 0) { setDeger(0); return; }
    if (basladi.current) return;
    basladi.current = true;

    const timeout = setTimeout(() => {
      const baslangic = performance.now();
      const step = () => {
        const gecen  = performance.now() - baslangic;
        const ilerleme = Math.min(gecen / sure, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - ilerleme, 3);
        setDeger(Math.round(eased * hedef));
        if (ilerleme < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, gecikme);

    return () => clearTimeout(timeout);
  }, [hedef, sure, gecikme]);

  return deger;
}
