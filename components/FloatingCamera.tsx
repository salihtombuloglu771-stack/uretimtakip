"use client";

import { useState, useRef } from "react";
import { Camera, X, PlusCircle, CheckCircle } from "lucide-react";
import { OTURUM_ANAHTARI } from "./AuthGuard";
import { getIsEmirleri, addKaliteKontrol } from "@/lib/db";
import type { IsEmri } from "@/data/types";

export default function FloatingCamera() {
  // ssr:false ile yüklendiği için localStorage her zaman erişilebilir
  const giris = localStorage.getItem(OTURUM_ANAHTARI) === "aktif";

  const [acik,         setAcik]         = useState(false);
  const [fotograf,     setFotograf]     = useState<string | null>(null);
  const [isEmirleri,   setIsEmirleri]   = useState<IsEmri[]>([]);
  const [isEmriId,     setIsEmriId]     = useState("");
  const [uygunAdet,    setUygunAdet]    = useState("");
  const [uygunsuzAdet, setUygunsuzAdet] = useState("0");
  const [kontrolEden,  setKontrolEden]  = useState(
    () => localStorage.getItem("uretim_kullanici_adi") ?? ""
  );
  const [kaydedildi,   setKaydedildi]   = useState(false);
  const [kaydetHata,   setKaydetHata]   = useState("");
  const kameraRef = useRef<HTMLInputElement>(null);

  if (!giris) return null;

  async function handleAc() {
    setAcik(true);
    if (isEmirleri.length === 0) {
      const data = await getIsEmirleri();
      setIsEmirleri(data);
    }
  }

  function handleKapat() {
    setAcik(false);
    setFotograf(null);
    setIsEmriId("");
    setUygunAdet("");
    setUygunsuzAdet("0");
    setKaydetHata("");
  }

  function handleFotograf(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    const reader = new FileReader();
    reader.onload = () => setFotograf(reader.result as string);
    reader.readAsDataURL(dosya);
    if (kameraRef.current) kameraRef.current.value = "";
  }

  async function handleKaydet() {
    if (!uygunAdet.trim()) { setKaydetHata("Uygun adet zorunludur."); return; }
    const secilen    = isEmirleri.find((k) => k.id === isEmriId);
    const uygun      = parseInt(uygunAdet, 10);
    const uygunsuz   = parseInt(uygunsuzAdet, 10);
    const toplam     = (isNaN(uygun) ? 0 : uygun) + (isNaN(uygunsuz) ? 0 : uygunsuz);
    const sonuc      = toplam > 0 && (isNaN(uygunsuz) ? 0 : uygunsuz) / toplam > 0.05 ? "kaldi" : "gecti";

    setKaydetHata("");
    await addKaliteKontrol({
      isEmriNo:      secilen?.isEmriNo ?? "—",
      urunAdi:       secilen?.urunAdi  ?? "—",
      kontrolTarihi: new Date().toISOString().split("T")[0],
      kontrolEden:   kontrolEden.trim() || "—",
      uygunAdet:     isNaN(uygun)    ? 0 : uygun,
      uygunsuzAdet:  isNaN(uygunsuz) ? 0 : uygunsuz,
      sonuc,
    });

    setKaydedildi(true);
    setTimeout(() => { setKaydedildi(false); handleKapat(); }, 2000);
  }

  return (
    <>
      <input ref={kameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFotograf} />

      {!acik && (
        <button onClick={handleAc} title="Fotoğraflı Sayım"
          className="fixed bottom-24 right-8 w-14 h-14 bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 z-50">
          <Camera size={22} />
        </button>
      )}

      {acik && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[92vh] overflow-y-auto">

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <Camera size={18} className="text-violet-500" /> Fotoğraflı Sayım
              </h3>
              <button onClick={handleKapat} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {fotograf ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-violet-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotograf} alt="Önizleme" className="w-full max-h-52 object-contain" />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button onClick={() => kameraRef.current?.click()}
                      className="w-7 h-7 bg-violet-600/80 hover:bg-violet-700 text-white rounded-full flex items-center justify-center"
                      title="Yeniden çek">
                      <Camera size={13} />
                    </button>
                    <button onClick={() => setFotograf(null)}
                      className="w-7 h-7 bg-slate-800/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      title="Sil">
                      <X size={13} />
                    </button>
                  </div>
                  <p className="text-center text-violet-600 text-xs py-1.5 font-medium bg-violet-50 border-t border-violet-100">
                    Fotoğrafı referans alarak adet girin
                  </p>
                </div>
              ) : (
                <button onClick={() => kameraRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-violet-300 rounded-xl flex flex-col items-center justify-center gap-2 text-violet-500 hover:bg-violet-50 transition-colors">
                  <Camera size={26} />
                  <span className="text-sm font-medium">Fotoğraf çek veya seç</span>
                </button>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">İş Emri (opsiyonel)</label>
                <select value={isEmriId} onChange={(e) => setIsEmriId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="">— Seçiniz —</option>
                  {[...isEmirleri].reverse().map((k) => (
                    <option key={k.id} value={k.id}>{k.isEmriNo} — {k.urunAdi}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Uygun Adet</label>
                  <input type="number" value={uygunAdet} onChange={(e) => setUygunAdet(e.target.value)}
                    placeholder="0" min="0" inputMode="numeric"
                    className="bg-slate-50 border border-emerald-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Uygunsuz Adet</label>
                  <input type="number" value={uygunsuzAdet} onChange={(e) => setUygunsuzAdet(e.target.value)}
                    placeholder="0" min="0" inputMode="numeric"
                    className="bg-slate-50 border border-red-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Kontrol Eden</label>
                <input value={kontrolEden} onChange={(e) => setKontrolEden(e.target.value)}
                  placeholder="Ad Soyad"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>

              {kaydetHata && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{kaydetHata}</p>
              )}

              {kaydedildi ? (
                <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm font-medium">
                  <CheckCircle size={16} /> Kalite kontrol kaydı oluşturuldu!
                </div>
              ) : (
                <button onClick={handleKaydet}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-xl transition-colors">
                  <PlusCircle size={16} /> Kalite Kontrol Kaydet
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
