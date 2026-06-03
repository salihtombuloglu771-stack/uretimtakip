"use client";


import { apiAddKalite, apiDeleteKalite, apiGetIsEmirleri, apiGetKalite } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { ShieldCheck, PlusCircle, Trash2, CheckCircle, XCircle, Camera, X } from "lucide-react";
import type { KaliteKontrol, IsEmri } from "@/data/types";


interface FormState {
  isEmriNo: string; urunAdi: string; kontrolTarihi: string;
  kontrolEden: string; uygunAdet: string; uygunsuzAdet: string;
  sonuc: "gecti" | "kaldi"; aciklama: string;
}

const BOSLUK: FormState = {
  isEmriNo: "", urunAdi: "", kontrolTarihi: new Date().toISOString().split("T")[0],
  kontrolEden: "", uygunAdet: "", uygunsuzAdet: "0",
  sonuc: "gecti", aciklama: "",
};

export default function KaliteKontrolPage() {
  const [liste,      setListe]      = useState<KaliteKontrol[]>([]);
  const [isEmirleri, setIsEmirleri] = useState<IsEmri[]>([]);
  const [form,       setForm]       = useState<FormState>(BOSLUK);
  const [hata,       setHata]       = useState("");
  const [loading,    setLoading]    = useState(true);
  const [fotograf,   setFotograf]   = useState<string | null>(null);
  const kameraRef = useRef<HTMLInputElement>(null);

  function handleFotograf(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    const reader = new FileReader();
    reader.onload = () => setFotograf(reader.result as string);
    reader.readAsDataURL(dosya);
    if (kameraRef.current) kameraRef.current.value = "";
  }

  useEffect(() => {
    Promise.all([apiGetKalite(), apiGetIsEmirleri()]).then(([kaliteData, isData]) => {
      setListe(kaliteData);
      setIsEmirleri(isData);
      setLoading(false);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleIsEmriSec(e: React.ChangeEvent<HTMLSelectElement>) {
    const secilen = isEmirleri.find((k) => k.id === e.target.value);
    if (secilen) {
      setForm((p) => ({ ...p, isEmriNo: secilen.isEmriNo, urunAdi: secilen.urunAdi }));
    }
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.isEmriNo.trim() || !form.urunAdi.trim() || !form.kontrolEden.trim()) {
      setHata("İş emri no, ürün adı ve kontrol eden zorunludur."); return;
    }
    const uygun    = parseInt(form.uygunAdet,    10);
    const uygunsuz = parseInt(form.uygunsuzAdet, 10);
    if (isNaN(uygun) || uygun < 0) { setHata("Uygun adet geçersiz."); return; }
    setHata("");
    const yeni: Omit<KaliteKontrol, "id"> = {
      isEmriNo:      form.isEmriNo.trim(),
      urunAdi:       form.urunAdi.trim(),
      kontrolTarihi: form.kontrolTarihi,
      kontrolEden:   form.kontrolEden.trim(),
      uygunAdet:     uygun,
      uygunsuzAdet:  isNaN(uygunsuz) ? 0 : uygunsuz,
      sonuc:         form.sonuc,
      aciklama:      form.aciklama.trim() || undefined,
    };
    const { id } = await apiAddKalite(yeni);
    setListe((p) => [...p, { ...yeni, id }]);
    setForm((p) => ({ ...BOSLUK, kontrolEden: p.kontrolEden }));
  }

  async function handleSil(id: string) {
    await apiDeleteKalite(id);
    setListe((p) => p.filter((x) => x.id !== id));
  }

  const gecenSayi    = liste.filter((k) => k.sonuc === "gecti").length;
  const kalanSayi    = liste.filter((k) => k.sonuc === "kaldi").length;
  const uygunsuzOran = liste.length > 0
    ? ((liste.reduce((t, k) => t + k.uygunsuzAdet, 0) /
        Math.max(1, liste.reduce((t, k) => t + k.uygunAdet + k.uygunsuzAdet, 0))) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-slate-100">
          <Sidebar />
          <main className="flex-1 ml-60 p-6 flex items-center justify-center">
            <p className="text-slate-500 text-sm">Yükleniyor…</p>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Kalite Kontrol</h1>
            <p className="text-slate-500 text-sm mt-0.5">İş emirlerine kalite kontrol kaydı ekle</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Kontrol</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Geçti</p>
            <p className="text-emerald-600 text-3xl font-bold mt-1">{gecenSayi}</p>
          </div>
          <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Kaldı</p>
            <p className="text-red-500 text-3xl font-bold mt-1">{kalanSayi}</p>
          </div>
          <div className={`bg-white border rounded-xl p-5 shadow-sm ${parseFloat(uygunsuzOran) > 5 ? "border-red-100" : "border-slate-200"}`}>
            <p className="text-slate-500 text-xs uppercase tracking-wide">Uygunsuzluk Oranı</p>
            <p className={`text-3xl font-bold mt-1 ${parseFloat(uygunsuzOran) > 5 ? "text-red-500" : "text-slate-700"}`}>
              %{uygunsuzOran}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
              <PlusCircle size={18} className="text-blue-500" /> Yeni Kontrol Kaydı
            </h2>
            {/* Kamera butonu */}
            <button type="button" onClick={() => kameraRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-medium rounded-lg transition-colors">
              <Camera size={14} /> Fotoğraf Çek
            </button>
          </div>

          {/* Gizli kamera input */}
          <input ref={kameraRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={handleFotograf} />

          {/* Fotoğraf önizleme */}
          {fotograf && (
            <div className="mb-4 relative">
              <div className="relative rounded-xl overflow-hidden border-2 border-violet-300 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotograf} alt="Fotoğraf önizleme" className="w-full max-h-56 object-contain" />
                <button type="button" onClick={() => setFotograf(null)}
                  className="absolute top-2 right-2 w-7 h-7 bg-slate-800/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                  <X size={14} />
                </button>
              </div>
              <p className="text-violet-600 text-xs text-center mt-1.5 font-medium">
                Fotoğrafı referans alarak uygun / uygunsuz adet girin
              </p>
            </div>
          )}

          <form onSubmit={handleEkle} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* İş emri seç */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">İş Emri</label>
                {isEmirleri.length > 0 ? (
                  <select onChange={handleIsEmriSec} defaultValue=""
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                    <option value="">— Seç veya manuel gir —</option>
                    {[...isEmirleri].reverse().map((k) => (
                      <option key={k.id} value={k.id}>{k.isEmriNo} — {k.urunAdi}</option>
                    ))}
                  </select>
                ) : (
                  <input name="isEmriNo" value={form.isEmriNo} onChange={handleChange} placeholder="ör. IE-001"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                )}
                {isEmirleri.length > 0 && (
                  <input name="isEmriNo" value={form.isEmriNo} onChange={handleChange} placeholder="Manuel İş Emri No"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Ürün Adı</label>
                <input name="urunAdi" value={form.urunAdi} onChange={handleChange} placeholder="ör. Mil Dişlisi"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Kontrol Eden</label>
                <input name="kontrolEden" value={form.kontrolEden} onChange={handleChange} placeholder="Ad Soyad"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Kontrol Tarihi</label>
                <input type="date" name="kontrolTarihi" value={form.kontrolTarihi} onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Uygun Adet</label>
                <input name="uygunAdet" value={form.uygunAdet} onChange={handleChange} placeholder="0" inputMode="numeric"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Uygunsuz Adet</label>
                <input name="uygunsuzAdet" value={form.uygunsuzAdet} onChange={handleChange} placeholder="0" inputMode="numeric"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Sonuç</label>
                <select name="sonuc" value={form.sonuc} onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                  <option value="gecti">✅ Geçti</option>
                  <option value="kaldi">❌ Kaldı</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Açıklama</label>
              <input name="aciklama" value={form.aciklama} onChange={handleChange} placeholder="İsteğe bağlı açıklama"
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
            </div>

            {hata && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>}

            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                <PlusCircle size={16} /> Kaydet
              </button>
            </div>
          </form>
        </div>

        {/* Liste */}
        {liste.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
            <ShieldCheck size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">Henüz kalite kontrol kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-500" /> Kontrol Kayıtları
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} kayıt</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["İş Emri No", "Ürün", "Kontrol Eden", "Tarih", "Uygun", "Uygunsuz", "Oran", "Sonuç", "Açıklama", ""].map((b) => (
                      <th key={b} className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...liste].reverse().map((k, i) => {
                    const toplam = k.uygunAdet + k.uygunsuzAdet;
                    const oran   = toplam > 0 ? ((k.uygunsuzAdet / toplam) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={k.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        <td className="px-4 py-3 text-blue-600 font-medium">{k.isEmriNo}</td>
                        <td className="px-4 py-3 text-slate-800">{k.urunAdi}</td>
                        <td className="px-4 py-3 text-slate-600">{k.kontrolEden}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(k.kontrolTarihi).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 text-emerald-600 font-medium">{k.uygunAdet.toLocaleString("tr-TR")}</td>
                        <td className="px-4 py-3 text-red-500 font-medium">{k.uygunsuzAdet.toLocaleString("tr-TR")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            parseFloat(oran) > 5 ? "text-red-600 bg-red-100" : "text-emerald-600 bg-emerald-100"
                          }`}>%{oran}</span>
                        </td>
                        <td className="px-4 py-3">
                          {k.sonuc === "gecti" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-100">
                              <CheckCircle size={11} /> Geçti
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-red-600 bg-red-100">
                              <XCircle size={11} /> Kaldı
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{k.aciklama || "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleSil(k.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
    </AuthGuard>
  );
}
