"use client";


import { apiAddDurus, apiDeleteDurus, apiGetDurus, apiGetMakinalar } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import { useState, useEffect } from "react";
import { PauseCircle, PlusCircle, Trash2 } from "lucide-react";
import type { Durus, DurusNeden, Makina } from "@/data/types";


const NEDEN_ETIKET: Record<DurusNeden, string> = {
  ariza:    "🔴 Arıza",
  bakim:    "🔧 Bakım",
  malzeme:  "📦 Malzeme Eksikliği",
  kalip:    "🔩 Kalıp Değişimi",
  diger:    "⚪ Diğer",
};

const simdikiZaman = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
};

export default function DurusKaydiPage() {
  const [liste,     setListe]    = useState<Durus[]>([]);
  const [makinalar, setMakinalar] = useState<Makina[]>([]);
  const [form,      setForm]     = useState<{ makinaNo: string; baslangicTarihi: string; bitisTarihi: string; neden: DurusNeden; aciklama: string }>({
    makinaNo: "", baslangicTarihi: simdikiZaman(), bitisTarihi: simdikiZaman(), neden: "ariza", aciklama: "",
  });
  const [hata,    setHata]    = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetDurus(), apiGetMakinalar()]).then(([durusData, makinaData]) => {
      setListe(durusData);
      setMakinalar(makinaData);
      setLoading(false);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function sureDk(bas: string, bit: string): number {
    const fark = new Date(bit).getTime() - new Date(bas).getTime();
    return Math.max(0, Math.round(fark / 60000));
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.makinaNo) { setHata("Makina seçiniz."); return; }
    if (new Date(form.bitisTarihi) <= new Date(form.baslangicTarihi)) {
      setHata("Bitiş tarihi başlangıçtan önce olamaz.");
      return;
    }
    setHata("");
    const yeni: Omit<Durus, "id"> = {
      makinaNo: form.makinaNo,
      baslangicTarihi: form.baslangicTarihi,
      bitisTarihi: form.bitisTarihi,
      neden: form.neden,
      aciklama: form.aciklama,
    };
    const { id } = await apiAddDurus(yeni);
    setListe((p) => [...p, { ...yeni, id }]);
    setForm((p) => ({ ...p, baslangicTarihi: simdikiZaman(), bitisTarihi: simdikiZaman(), aciklama: "" }));
  }

  async function handleSil(id: string) {
    await apiDeleteDurus(id);
    setListe((p) => p.filter((x) => x.id !== id));
  }

  const toplamDk = liste.reduce((t, d) => t + sureDk(d.baslangicTarihi, d.bitisTarihi), 0);

  

  return (
    <PageLayout baslik="Duruş Kaydı" altyazi="Makina duruş kayıtları">


        {/* Özet */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Duruş</p>
            <p className="text-red-500 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
          <div className="bg-white border border-orange-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Duruş Süresi</p>
            <p className="text-orange-600 text-3xl font-bold mt-1">
              {toplamDk >= 60 ? `${Math.floor(toplamDk / 60)}s ${toplamDk % 60}dk` : `${toplamDk} dk`}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
            <PlusCircle size={18} className="text-blue-500" /> Yeni Duruş Kaydı
          </h2>
          <form onSubmit={handleEkle} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Makina */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Makina</label>
                <select name="makinaNo" value={form.makinaNo} onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                  <option value="">— Makina Seç —</option>
                  {makinalar.map((m) => <option key={m.id} value={m.makinaNo}>{m.makinaNo} — {m.makinaAdi}</option>)}
                  <option value="MANUEL">Manuel Giriş</option>
                </select>
                {form.makinaNo === "MANUEL" && (
                  <input name="makinaNo" onChange={handleChange} placeholder="Makina No giriniz"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                )}
              </div>

              {/* Neden */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Duruş Nedeni</label>
                <select name="neden" value={form.neden} onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                  {(Object.keys(NEDEN_ETIKET) as DurusNeden[]).map((k) => (
                    <option key={k} value={k}>{NEDEN_ETIKET[k]}</option>
                  ))}
                </select>
              </div>

              {/* Başlangıç */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Başlangıç</label>
                <input type="datetime-local" name="baslangicTarihi" value={form.baslangicTarihi} onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>

              {/* Bitiş */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Bitiş</label>
                <input type="datetime-local" name="bitisTarihi" value={form.bitisTarihi} onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>
            </div>

            {/* Açıklama */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Açıklama</label>
              <input name="aciklama" value={form.aciklama} onChange={handleChange} placeholder="İsteğe bağlı açıklama"
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
            </div>

            {hata && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>}

            {/* Süre önizlemesi */}
            {form.baslangicTarihi && form.bitisTarihi && (
              <p className="text-slate-500 text-xs">
                Hesaplanan süre: <span className="font-semibold text-slate-700">{sureDk(form.baslangicTarihi, form.bitisTarihi)} dakika</span>
              </p>
            )}

            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                <PlusCircle size={16} /> Kaydet
              </button>
            </div>
          </form>
        </div>

        {/* Liste */}
        {liste.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <PauseCircle size={18} className="text-red-500" /> Duruş Kayıtları
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} kayıt</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Makina", "Neden", "Başlangıç", "Bitiş", "Süre", "Açıklama", ""].map((b) => (
                      <th key={b} className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...liste].reverse().map((d, i) => {
                    const dk = sureDk(d.baslangicTarihi, d.bitisTarihi);
                    return (
                      <tr key={d.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        <td className="px-4 py-3 text-blue-600 font-medium">{d.makinaNo}</td>
                        <td className="px-4 py-3 text-slate-700 text-xs whitespace-nowrap">{NEDEN_ETIKET[d.neden]}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{d.baslangicTarihi.replace("T", " ")}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{d.bitisTarihi.replace("T", " ")}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dk > 120 ? "text-red-600 bg-red-100" : dk > 30 ? "text-amber-600 bg-amber-100" : "text-emerald-600 bg-emerald-100"}`}>
                            {dk >= 60 ? `${Math.floor(dk / 60)}s ${dk % 60}dk` : `${dk}dk`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{d.aciklama || "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleSil(d.id)}
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
    </PageLayout>
  );
}
