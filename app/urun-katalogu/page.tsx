"use client";


import { apiAddUrun, apiDeleteUrun, apiGetUrunler } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { useState, useEffect } from "react";
import { getRol } from "@/components/AuthGuard";
import { BookOpen, PlusCircle, Trash2 } from "lucide-react";
import type { Urun } from "@/data/types";


export default function UrunKataloguPage() {
  const { toast } = useToast();
  const [silId, setSilId] = useState<string | null>(null);
  const [liste,   setListe]   = useState<Urun[]>([]);
  const [form,    setForm]    = useState<{ urunKodu: string; urunAdi: string; birimFiyat: string }>({ urunKodu: "", urunAdi: "", birimFiyat: "" });
  const [hata,    setHata]    = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    apiGetUrunler().then((data) => {
      setListe(data);
      setLoading(false);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.urunKodu.trim() || !form.urunAdi.trim()) {
      setHata("Ürün kodu ve adı zorunludur.");
      return;
    }
    if (liste.some((u) => u.urunKodu.toLowerCase() === form.urunKodu.trim().toLowerCase())) {
      setHata("Bu ürün kodu zaten kayıtlı.");
      return;
    }
    const fiyat = parseFloat(form.birimFiyat.replace(",", "."));
    setHata("");
    const yeni: Omit<Urun, "id"> = {
      urunKodu:   form.urunKodu.trim(),
      urunAdi:    form.urunAdi.trim(),
      birimFiyat: isNaN(fiyat) ? 0 : fiyat,
    };
    const { id } = await apiAddUrun(yeni);
    setListe((p) => [...p, { ...yeni, id }]);
    setForm({ urunKodu: "", urunAdi: "", birimFiyat: "" });
  }

  async function handleSil() {
    if (!silId) return;
    try {
      await apiDeleteUrun(silId);
      setListe((p) => p.filter((x) => x.id !== silId));
      toast("Ürün silindi.", "basari");
    } catch { toast("Silinemedi.", "hata"); }
    finally { setSilId(null); }
  }

  

  return (
    <PageLayout baslik="Ürün Kataloğu" altyazi="Ürün listesi ve fiyat bilgileri">


        {/* Özet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Ürün</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
          <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Ort. Birim Fiyat</p>
            <p className="text-violet-600 text-3xl font-bold mt-1">
              {liste.length > 0
                ? (liste.reduce((t, u) => t + u.birimFiyat, 0) / liste.length).toLocaleString("tr-TR", { minimumFractionDigits: 2 })
                : "0,00"} ₺
            </p>
          </div>
        </div>

        {/* Ekle formu */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
              <PlusCircle size={18} className="text-blue-500" /> Yeni Ürün Ekle
            </h2>
            <form onSubmit={handleEkle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Ürün Kodu", name: "urunKodu", placeholder: "ör. URN-001" },
                  { label: "Ürün Adı",  name: "urunAdi",  placeholder: "ör. Mil Dişlisi A4" },
                  { label: "Birim Fiyat ₺", name: "birimFiyat", placeholder: "0.00" },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">{f.label}</label>
                    <input name={f.name} value={(form as Record<string, string>)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                    />
                  </div>
                ))}
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
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <EmptyState ikon={BookOpen} baslik="Ürün kataloğu boş"
              aciklama="Ürettiğiniz ürünleri kod, ad ve birim fiyatıyla tanımlayın." />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <BookOpen size={18} className="text-blue-500" /> Ürün Listesi
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} ürün</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Ürün Kodu", "Ürün Adı", "Birim Fiyat", ...(isAdmin ? [""] : [])].map((b) => (
                      <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liste.map((urun, i) => (
                    <tr key={urun.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                      <td className="px-5 py-3.5 text-blue-600 font-medium">{urun.urunKodu}</td>
                      <td className="px-5 py-3.5 text-slate-800">{urun.urunAdi}</td>
                      <td className="px-5 py-3.5 text-violet-700 font-medium">
                        {urun.birimFiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <button onClick={() => setSilId(urun.id)}
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
      <ConfirmModal
        acik={silId !== null}
        mesaj="Bu kaydı silmek istediğinizden emin misiniz?"
        onOnayla={handleSil}
        onIptal={() => setSilId(null)}
      />
    </PageLayout>
  );
}
