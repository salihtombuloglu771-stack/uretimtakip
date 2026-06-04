"use client";


import { apiAddDemirbas, apiDeleteDemirbas, apiGetDemirbaslar } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import { useState, useEffect } from "react";
import { getRol } from "@/components/AuthGuard";
import { Building, PlusCircle, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { DemirbasKayit } from "@/data/types";


interface FormState {
  demirbasNo: string; demirbasAdi: string; konum: string;
  alisTarihi: string; alisFiyati: string; durum: "aktif" | "pasif";
}

const BOSLUK: FormState = {
  demirbasNo: "", demirbasAdi: "", konum: "",
  alisTarihi: "", alisFiyati: "", durum: "aktif",
};

export default function SabitKiymetPage() {
  const [liste,   setListe]   = useState<DemirbasKayit[]>([]);
  const [form,    setForm]    = useState<FormState>(BOSLUK);
  const [hata,    setHata]    = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    apiGetDemirbaslar().then((data) => {
      setListe(data);
      setLoading(false);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.demirbasNo.trim() || !form.demirbasAdi.trim()) {
      setHata("Demirbaş numarası ve adı zorunludur."); return;
    }
    if (liste.some((d) => d.demirbasNo.toLowerCase() === form.demirbasNo.trim().toLowerCase())) {
      setHata("Bu demirbaş numarası zaten kayıtlı."); return;
    }
    const fiyat = parseFloat(form.alisFiyati.replace(",", "."));
    setHata("");
    const yeni: Omit<DemirbasKayit, "id"> = {
      demirbasNo:  form.demirbasNo.trim(),
      demirbasAdi: form.demirbasAdi.trim(),
      konum:       form.konum.trim() || undefined,
      alisTarihi:  form.alisTarihi || undefined,
      alisFiyati:  isNaN(fiyat) ? undefined : fiyat,
      durum:       form.durum,
    };
    const { id } = await apiAddDemirbas(yeni);
    setListe((p) => [...p, { ...yeni, id }]);
    setForm(BOSLUK);
  }

  async function handleSil(id: string) {
    await apiDeleteDemirbas(id);
    setListe((p) => p.filter((d) => d.id !== id));
  }

  const aktifSayi   = liste.filter((d) => d.durum === "aktif").length;
  const toplamDeger = liste.reduce((t, d) => t + (d.alisFiyati ?? 0), 0);

  

  return (
    <PageLayout baslik="Sabit Kıymet" altyazi="Demirbaş kayıtları">


        {/* Özet */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Demirbaş</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Aktif</p>
            <p className="text-emerald-600 text-3xl font-bold mt-1">{aktifSayi}</p>
          </div>
          <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Değer</p>
            <p className="text-violet-600 text-3xl font-bold mt-1">
              {toplamDeger.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
            </p>
          </div>
        </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
              <PlusCircle size={18} className="text-blue-500" /> Yeni Demirbaş Ekle
            </h2>
            <form onSubmit={handleEkle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Demirbaş No</label>
                  <input name="demirbasNo" value={form.demirbasNo} onChange={handleChange} placeholder="ör. DMB-001"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Demirbaş Adı</label>
                  <input name="demirbasAdi" value={form.demirbasAdi} onChange={handleChange} placeholder="ör. Forklift"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Konum</label>
                  <input name="konum" value={form.konum} onChange={handleChange} placeholder="ör. Üretim Sahası"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Alış Tarihi</label>
                  <input type="date" name="alisTarihi" value={form.alisTarihi} onChange={handleChange}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Alış Fiyatı ₺</label>
                  <input name="alisFiyati" value={form.alisFiyati} onChange={handleChange} placeholder="0.00" inputMode="decimal"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Durum</label>
                  <select name="durum" value={form.durum} onChange={handleChange}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                    <option value="aktif">Aktif</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </div>
              </div>
              {hata && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>}
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <PlusCircle size={16} /> Ekle
                </button>
              </div>
            </form>
          </div>

        {/* Liste */}
        {liste.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
            <Building size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">Henüz demirbaş kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <Building size={18} className="text-blue-500" /> Demirbaş Listesi
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} kayıt</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Demirbaş No", "Adı", "Konum", "Alış Tarihi", "Alış Fiyatı", "Durum", ...(isAdmin ? [""] : [])].map((b) => (
                      <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liste.map((d, i) => (
                    <tr key={d.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                      <td className="px-5 py-3.5 text-blue-600 font-medium">{d.demirbasNo}</td>
                      <td className="px-5 py-3.5 text-slate-800">{d.demirbasAdi}</td>
                      <td className="px-5 py-3.5 text-slate-500">{d.konum || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {d.alisTarihi ? new Date(d.alisTarihi).toLocaleDateString("tr-TR") : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-violet-700 font-medium">
                        {d.alisFiyati != null
                          ? d.alisFiyati.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺"
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          d.durum === "aktif"
                            ? "text-emerald-600 bg-emerald-100"
                            : "text-slate-500 bg-slate-100"
                        }`}>
                          {d.durum === "aktif"
                            ? <><CheckCircle size={11} /> Aktif</>
                            : <><XCircle size={11} /> Pasif</>}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleSil(d.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

    </PageLayout>
  );
}
