"use client";


import { apiAddDepo, apiDeleteDepo, apiGetDepo } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { useState, useEffect, useCallback } from "react";
import { getRol } from "@/components/AuthGuard";
import { Truck, PlusCircle, Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { DepoHareketi } from "@/data/types";


interface FormState {
  urunAdi: string; miktar: string; birim: string;
  hareketTuru: "giris" | "cikis"; tarih: string; aciklama: string;
}

const BOSLUK: FormState = {
  urunAdi: "", miktar: "", birim: "adet",
  hareketTuru: "giris", tarih: new Date().toISOString().split("T")[0], aciklama: "",
};

export default function SevkiyatDepoPage() {
  const { toast } = useToast();
  const [silId, setSilId] = useState<string | null>(null);
  const [liste,   setListe]   = useState<DepoHareketi[]>([]);
  const [form,    setForm]    = useState<FormState>(BOSLUK);
  const [hata,    setHata]    = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const yukle = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetDepo();
      setListe(data.filter((h) => h.depoTuru === "sevkiyat"));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    yukle();
  }, [yukle]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.urunAdi.trim() || !form.miktar) { setHata("Ürün adı ve miktar zorunludur."); return; }
    const miktar = parseFloat(form.miktar.replace(",", "."));
    if (isNaN(miktar) || miktar <= 0) { setHata("Miktar geçerli bir sayı olmalıdır."); return; }
    setHata("");
    const yeni: Omit<DepoHareketi, "id"> = {
      depoTuru:    "sevkiyat",
      urunAdi:     form.urunAdi.trim(),
      miktar,
      birim:       form.birim.trim() || "adet",
      hareketTuru: form.hareketTuru,
      tarih:       form.tarih,
      aciklama:    form.aciklama.trim() || undefined,
    };
    const { id } = await apiAddDepo(yeni);
    setListe((p) => [...p, { ...yeni, id }]);
    setForm((p) => ({ ...BOSLUK, hareketTuru: p.hareketTuru }));
  }

  async function handleSil() {
    if (!silId) return;
    try {
      await apiDeleteDepo(silId);
      setListe((p) => p.filter((x) => x.id !== silId));
      toast("Hareket silindi.", "basari");
    } catch { toast("Silinemedi.", "hata"); }
    finally { setSilId(null); }
  }

  const toplamGiris = liste.filter((h) => h.hareketTuru === "giris").reduce((t, h) => t + h.miktar, 0);
  const toplamCikis = liste.filter((h) => h.hareketTuru === "cikis").reduce((t, h) => t + h.miktar, 0);

  

  return (
    <PageLayout baslik="Sevkiyat Depo" altyazi="Sevkiyat depo giriş/çıkış hareketleri" yenile={yukle} yukleniyor={loading}>

        {/* Özet */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Giriş</p>
            <p className="text-emerald-600 text-3xl font-bold mt-1">{toplamGiris.toLocaleString("tr-TR")}</p>
          </div>
          <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Çıkış</p>
            <p className="text-red-500 text-3xl font-bold mt-1">{toplamCikis.toLocaleString("tr-TR")}</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Hareket Sayısı</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
        </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
              <PlusCircle size={18} className="text-blue-500" /> Yeni Hareket Ekle
            </h2>
            <form onSubmit={handleEkle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Ürün / Malzeme Adı</label>
                  <input name="urunAdi" value={form.urunAdi} onChange={handleChange} placeholder="ör. Mil Dişlisi A4"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Miktar</label>
                  <input name="miktar" value={form.miktar} onChange={handleChange} placeholder="0" inputMode="decimal"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Birim</label>
                  <input name="birim" value={form.birim} onChange={handleChange} placeholder="adet / kg / m"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Hareket Türü</label>
                  <select name="hareketTuru" value={form.hareketTuru} onChange={handleChange}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                    <option value="giris">Giriş</option>
                    <option value="cikis">Çıkış</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Tarih</label>
                  <input type="date" name="tarih" value={form.tarih} onChange={handleChange}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Açıklama</label>
                  <input name="aciklama" value={form.aciklama} onChange={handleChange} placeholder="İsteğe bağlı"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
              </div>
              {hata && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>}
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <PlusCircle size={16} /> Kaydet
                </button>
              </div>
            </form>
          </div>

        {/* Hareketler tablosu */}
        {liste.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
            <Truck size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">Henüz hareket kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <Truck size={18} className="text-blue-500" /> Hareketler
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} kayıt</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Ürün / Malzeme", "Hareket", "Miktar", "Birim", "Tarih", "Açıklama", ...(isAdmin ? [""] : [])].map((b) => (
                      <th key={b} className="px-4 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...liste].reverse().map((h, i) => (
                    <tr key={h.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                      <td className="px-4 py-3 text-slate-800 font-medium">{h.urunAdi}</td>
                      <td className="px-4 py-3">
                        {h.hareketTuru === "giris" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-100">
                            <ArrowDownCircle size={11} /> Giriş
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-red-600 bg-red-100">
                            <ArrowUpCircle size={11} /> Çıkış
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{h.miktar.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3 text-slate-500">{h.birim}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {new Date(h.tarih).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{h.aciklama || "—"}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <button onClick={() => setSilId(h.id)}
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
