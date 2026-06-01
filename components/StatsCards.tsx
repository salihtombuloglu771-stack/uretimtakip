"use client";

import { TrendingUp, AlertTriangle, ClipboardCheck, DollarSign } from "lucide-react";
import type { IsEmri } from "@/data/types";

interface Props {
  isEmriListesi: IsEmri[];
}

export default function StatsCards({ isEmriListesi }: Props) {
  const toplamUretim = isEmriListesi.reduce((t, k) => t + k.uretimAdedi, 0);
  const toplamFire   = isEmriListesi.reduce((t, k) => t + k.fireAdedi,   0);
  const stokDegeri   = isEmriListesi.reduce((t, k) => t + (k.uretimAdedi - k.fireAdedi) * (k.birimFiyat || 0), 0);
  const genelFireOrani = toplamUretim > 0 ? (toplamFire / toplamUretim) * 100 : 0;

  const kartlar = [
    { baslik: "Toplam Üretim", deger: toplamUretim.toLocaleString("tr-TR"), birim: "adet", ikon: TrendingUp, renk: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { baslik: "Toplam Fire",   deger: toplamFire.toLocaleString("tr-TR"),   birim: "adet", ikon: AlertTriangle, renk: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
    { baslik: "Açık İş Emri", deger: isEmriListesi.length.toLocaleString("tr-TR"), birim: "kayıt", ikon: ClipboardCheck, renk: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { baslik: "Stok Değeri",  deger: stokDegeri.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), birim: "₺", ikon: DollarSign, renk: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  ];

  return (
    <div className="space-y-3">
      {/* Fire oranı >%10 ise uyarı banner */}
      {genelFireOrani > 10 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">
            Uyarı: Genel fire oranı <span className="font-bold">%{genelFireOrani.toFixed(1)}</span> — kritik eşik (%10) aşıldı!
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kartlar.map((kart) => {
          const Ikon = kart.ikon;
          return (
            <div key={kart.baslik} className={`bg-white border ${kart.border} rounded-xl p-5 flex items-center gap-4 shadow-sm`}>
              <div className={`w-11 h-11 rounded-xl ${kart.bg} flex items-center justify-center flex-shrink-0`}>
                <Ikon size={20} className={kart.renk} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-xs uppercase tracking-wide truncate">{kart.baslik}</p>
                <p className="text-slate-800 text-xl font-bold mt-0.5 truncate">
                  {kart.deger}
                  <span className="text-slate-400 text-xs font-normal ml-1">{kart.birim}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
