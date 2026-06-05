"use client";

import { Trash2, ClipboardList, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { IsEmri } from "@/data/types";

const VARDİYA_ETIKET: Record<string, string> = {
  sabah: "1. Vardiya",
  oglen: "2. Vardiya",
  gece:  "Gece",
};

// Tarihe göre göreli süre
function goreli(tarih: string) {
  const fark = Math.floor((Date.now() - new Date(tarih).getTime()) / 86400000);
  if (fark === 0) return "Bugün";
  if (fark === 1) return "Dün";
  if (fark < 7)   return `${fark} gün önce`;
  if (fark < 30)  return `${Math.floor(fark / 7)} hafta önce`;
  return new Date(tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

// Computed durum
function durumHesapla(k: IsEmri): { label: string; cls: string } {
  const verim = k.hedefAdedi && k.hedefAdedi > 0 ? k.uretimAdedi / k.hedefAdedi : null;
  if (verim !== null && verim >= 1)       return { label: "Hedefe Ulaştı", cls: "bg-emerald-100 text-emerald-700" };
  if (verim !== null && verim >= 0.8)     return { label: "Devam Ediyor",  cls: "bg-blue-100 text-blue-700"    };
  if (verim !== null && verim < 0.8)      return { label: "Geride",        cls: "bg-amber-100 text-amber-700"  };
  const gun = Math.floor((Date.now() - new Date(k.tarih).getTime()) / 86400000);
  if (gun === 0)                          return { label: "Bugün",         cls: "bg-violet-100 text-violet-700" };
  return { label: "Kaydedildi", cls: "bg-slate-100 text-slate-600" };
}

interface Props {
  isEmriListesi: IsEmri[];
  onSil?: (id: string) => void;
}

export default function IsEmriTablosu({ isEmriListesi, onSil }: Props) {

  if (isEmriListesi.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
        <ClipboardList size={40} className="text-slate-300" />
        <p className="text-slate-500 text-sm font-medium">Henüz iş emri kaydı yok.</p>
        <p className="text-slate-400 text-xs">Üretim emri girerek başlayın.</p>
      </div>
    );
  }

  // Özet hesapla
  const topUretim = isEmriListesi.reduce((t, k) => t + k.uretimAdedi, 0);
  const topFire   = isEmriListesi.reduce((t, k) => t + k.fireAdedi,   0);
  const topDeger  = isEmriListesi.reduce((t, k) => t + (k.uretimAdedi - k.fireAdedi) * (k.birimFiyat || 0), 0);
  const fireOrani = topUretim > 0 ? ((topFire / topUretim) * 100).toFixed(2) : "0.00";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Başlık + özet */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
            <ClipboardList size={18} className="text-blue-500" /> İş Emirleri
          </h2>
          <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {isEmriListesi.length} kayıt
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Toplam Üretim", deger: topUretim.toLocaleString("tr-TR"),  renk: "text-blue-600"   },
            { label: "Toplam Fire",   deger: topFire.toLocaleString("tr-TR"),    renk: "text-red-500"    },
            { label: "Fire Oranı",    deger: `%${fireOrani}`,                    renk: parseFloat(fireOrani) > 5 ? "text-red-500" : "text-emerald-600" },
            { label: "Net Değer",     deger: topDeger.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺", renk: "text-violet-700" },
          ].map(({ label, deger, renk }) => (
            <div key={label} className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 shadow-sm">
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">{label}</p>
              <p className={`${renk} text-base font-bold mt-0.5`}>{deger}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {[
                "Durum", "İş Emri No", "Ürün", "Makina", "Vardiya",
                "Üretim / Hedef", "Fire", "Fire %", "Verimlilik",
                "Birim Fiyat", "Net Değer", "Tarih",
                ...(onSil ? [""] : []),
              ].map((b) => (
                <th key={b} className="px-4 py-3 text-left text-slate-500 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap">{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...isEmriListesi].reverse().map((kayit, index) => {
              const fireOrani = kayit.uretimAdedi > 0
                ? ((kayit.fireAdedi / kayit.uretimAdedi) * 100).toFixed(2) : "0.00";
              const yuksekFire = parseFloat(fireOrani) > 5;

              const hedefYuzdesi = kayit.hedefAdedi && kayit.hedefAdedi > 0
                ? Math.min(100, Math.round((kayit.uretimAdedi / kayit.hedefAdedi) * 100)) : null;

              const netDeger = (kayit.uretimAdedi - kayit.fireAdedi) * (kayit.birimFiyat || 0);
              const durum    = durumHesapla(kayit);

              return (
                <tr key={kayit.id}
                  className={`border-b border-slate-100 last:border-b-0 hover:bg-blue-50/30 transition-colors animate-fade-in-up ${index % 2 !== 0 ? "bg-slate-50/40" : ""}`}
                  style={{ animationDelay: `${index * 20}ms` }}>

                  {/* Durum */}
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${durum.cls}`}>
                      {durum.label}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-blue-600 font-semibold whitespace-nowrap">{kayit.isEmriNo}</td>

                  <td className="px-4 py-3 text-slate-800 font-medium max-w-[140px] truncate">{kayit.urunAdi}</td>

                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                    {kayit.makinaNo
                      ? <span className="bg-slate-100 px-2 py-0.5 rounded-full">{kayit.makinaNo}</span>
                      : <span className="text-slate-300">—</span>}
                  </td>

                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                    {kayit.vardiya ? VARDİYA_ETIKET[kayit.vardiya] : "—"}
                  </td>

                  {/* Üretim / Hedef */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-800 font-semibold">{kayit.uretimAdedi.toLocaleString("tr-TR")}</span>
                      {kayit.hedefAdedi && (
                        <>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-500 text-xs">{kayit.hedefAdedi.toLocaleString("tr-TR")}</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">{kayit.fireAdedi.toLocaleString("tr-TR")}</td>

                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${yuksekFire ? "text-red-600 bg-red-100" : "text-emerald-600 bg-emerald-100"}`}>
                      %{fireOrani}
                    </span>
                  </td>

                  {/* Verimlilik */}
                  <td className="px-4 py-3 min-w-[90px]">
                    {hedefYuzdesi !== null ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-semibold ${hedefYuzdesi >= 100 ? "text-emerald-600" : hedefYuzdesi >= 80 ? "text-amber-600" : "text-red-500"}`}>
                            %{hedefYuzdesi}
                          </span>
                          {hedefYuzdesi >= 100 ? <TrendingUp size={11} className="text-emerald-500" />
                            : hedefYuzdesi >= 80 ? <Minus size={11} className="text-amber-500" />
                            : <TrendingDown size={11} className="text-red-400" />}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${hedefYuzdesi >= 100 ? "bg-emerald-500" : hedefYuzdesi >= 80 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${hedefYuzdesi}%` }} />
                        </div>
                      </div>
                    ) : <span className="text-slate-300 text-xs">Hedef yok</span>}
                  </td>

                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                    {kayit.birimFiyat ? kayit.birimFiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                  </td>

                  <td className="px-4 py-3 text-violet-700 font-semibold whitespace-nowrap text-xs">
                    {netDeger > 0 ? netDeger.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺" : "—"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-slate-700 text-xs font-medium">{goreli(kayit.tarih)}</span>
                      <span className="text-slate-400 text-[10px]">{new Date(kayit.tarih).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </td>

                  {onSil && (
                    <td className="px-4 py-3">
                      <button onClick={() => onSil(kayit.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
