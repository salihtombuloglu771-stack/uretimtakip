"use client";

import { Trash2, ClipboardList } from "lucide-react";
import type { IsEmri } from "@/data/types";

const VARDİYA_ETIKET: Record<string, string> = {
  sabah: "🌅 Sabah",
  oglen: "☀️ Öğlen",
  gece:  "🌙 Gece",
};

interface Props {
  isEmriListesi: IsEmri[];
  onSil?: (id: string) => void; // undefined ise sil butonu gösterilmez (operatör)
}

export default function IsEmriTablosu({ isEmriListesi, onSil }: Props) {

  if (isEmriListesi.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
        <ClipboardList size={40} className="text-slate-300" />
        <p className="text-slate-500 text-sm">Henüz iş emri kaydı yok.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
          <ClipboardList size={18} className="text-blue-500" />
          İş Emirleri
        </h2>
        <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{isEmriListesi.length} kayıt</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {[
                "İş Emri No", "Makina", "Ürün", "Vardiya",
                "Üretim", "Hedef", "Fire", "Fire %",
                "Birim Fiyat", "Stok Değeri", "Tarih",
                ...(onSil ? [""] : []),
              ].map((b) => (
                <th key={b} className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...isEmriListesi].reverse().map((kayit, index) => {
              const fireOrani = kayit.uretimAdedi > 0
                ? ((kayit.fireAdedi / kayit.uretimAdedi) * 100).toFixed(1)
                : "0.0";
              const yuksekFire = parseFloat(fireOrani) > 10;

              // Hedef tamamlanma yüzdesi
              const hedefYuzdesi = kayit.hedefAdedi && kayit.hedefAdedi > 0
                ? Math.min(100, Math.round((kayit.uretimAdedi / kayit.hedefAdedi) * 100))
                : null;

              const satirStok = (kayit.uretimAdedi - kayit.fireAdedi) * (kayit.birimFiyat || 0);

              return (
                <tr key={kayit.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${index % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                  <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">{kayit.isEmriNo}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{kayit.makinaNo || "—"}</td>
                  <td className="px-4 py-3 text-slate-800 whitespace-nowrap">{kayit.urunAdi}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                    {kayit.vardiya ? VARDİYA_ETIKET[kayit.vardiya] : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{kayit.uretimAdedi.toLocaleString("tr-TR")}</td>

                  {/* Hedef: tamamlanma yüzdesi */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {hedefYuzdesi !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 text-xs">{kayit.hedefAdedi?.toLocaleString("tr-TR")}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          hedefYuzdesi >= 100 ? "text-emerald-600 bg-emerald-100"
                          : hedefYuzdesi >= 70 ? "text-amber-600 bg-amber-100"
                          : "text-red-600 bg-red-100"
                        }`}>%{hedefYuzdesi}</span>
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>

                  <td className="px-4 py-3 text-slate-800">{kayit.fireAdedi.toLocaleString("tr-TR")}</td>

                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${yuksekFire ? "text-red-600 bg-red-100" : "text-emerald-600 bg-emerald-100"}`}>
                      %{fireOrani}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {kayit.birimFiyat ? kayit.birimFiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                  </td>
                  <td className="px-4 py-3 text-violet-700 font-medium whitespace-nowrap">
                    {satirStok > 0 ? satirStok.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                  </td>

                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(kayit.tarih).toLocaleDateString("tr-TR")}
                  </td>

                  {onSil && (
                    <td className="px-4 py-3">
                      <button onClick={() => onSil(kayit.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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
