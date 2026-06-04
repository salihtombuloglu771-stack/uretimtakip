"use client";


import { apiAddMakina, apiDeleteMakina, apiGetMakinalar, apiUpdateMakinaDurum } from "@/lib/api";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { getRol } from "@/components/AuthGuard";
import { Cpu, PlusCircle, Trash2, AlertTriangle } from "lucide-react";
import type { Makina } from "@/data/types";


interface FormState {
  makinaNo: string; makinaAdi: string; durum: "aktif" | "pasif";
  sonBakimTarihi: string; bakimPeriyoduGun: string;
}

const BOSLUK: FormState = {
  makinaNo: "", makinaAdi: "", durum: "aktif", sonBakimTarihi: "", bakimPeriyoduGun: "",
};

function bakimDurumu(m: Makina): { uyari: boolean; mesaj: string } {
  if (!m.sonBakimTarihi || !m.bakimPeriyoduGun) return { uyari: false, mesaj: "" };
  const sonBakim = new Date(m.sonBakimTarihi);
  const sonrakiBakim = new Date(sonBakim);
  sonrakiBakim.setDate(sonrakiBakim.getDate() + m.bakimPeriyoduGun);
  const bugun = new Date();
  const kalanGun = Math.ceil((sonrakiBakim.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
  if (kalanGun <= 0) return { uyari: true, mesaj: `Bakım ${Math.abs(kalanGun)} gün gecikmiş!` };
  if (kalanGun <= 7) return { uyari: true, mesaj: `Bakıma ${kalanGun} gün kaldı` };
  return { uyari: false, mesaj: `Bakıma ${kalanGun} gün kaldı` };
}

export default function MakinalarPage() {
  const [liste,   setListe]   = useState<Makina[]>([]);
  const [form,    setForm]    = useState<FormState>(BOSLUK);
  const [hata,    setHata]    = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    apiGetMakinalar().then((data) => {
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
    if (!form.makinaNo.trim() || !form.makinaAdi.trim()) {
      setHata("Makina numarası ve adı zorunludur."); return;
    }
    if (liste.some((m) => m.makinaNo.toLowerCase() === form.makinaNo.trim().toLowerCase())) {
      setHata("Bu makina numarası zaten kayıtlı."); return;
    }
    const periyot = parseInt(form.bakimPeriyoduGun, 10);
    setHata("");
    const yeni: Omit<Makina, "id"> = {
      makinaNo:        form.makinaNo.trim(),
      makinaAdi:       form.makinaAdi.trim(),
      durum:           form.durum,
      sonBakimTarihi:  form.sonBakimTarihi || undefined,
      bakimPeriyoduGun: isNaN(periyot) ? undefined : periyot,
    };
    const { id } = await apiAddMakina(yeni);
    setListe((p) => [...p, { ...yeni, id }]);
    setForm(BOSLUK);
  }

  async function toggleDurum(m: Makina) {
    const yeniDurum = m.durum === "aktif" ? "pasif" : "aktif";
    await apiUpdateMakinaDurum(m.id, yeniDurum);
    setListe((p) => p.map((x) => x.id === m.id ? { ...x, durum: yeniDurum } : x));
  }

  async function handleSil(id: string) {
    await apiDeleteMakina(id);
    setListe((p) => p.filter((m) => m.id !== id));
  }

  const aktifSayi   = liste.filter((m) => m.durum === "aktif").length;
  const uyariSayi   = liste.filter((m) => bakimDurumu(m).uyari).length;

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-slate-100">
          <Sidebar />
          <main className="flex-1 md:ml-60 p-6 flex items-center justify-center">
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
      <main className="flex-1 md:ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Makinalar</h1>
            <p className="text-slate-500 text-sm mt-0.5">Makina parkı ve bakım takibi</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Makina</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Aktif</p>
            <p className="text-emerald-600 text-3xl font-bold mt-1">{aktifSayi}</p>
          </div>
          <div className={`bg-white border rounded-xl p-5 shadow-sm ${uyariSayi > 0 ? "border-amber-200" : "border-slate-200"}`}>
            <p className="text-slate-500 text-xs uppercase tracking-wide">Bakım Uyarısı</p>
            <p className={`text-3xl font-bold mt-1 ${uyariSayi > 0 ? "text-amber-500" : "text-slate-400"}`}>{uyariSayi}</p>
          </div>
        </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
              <PlusCircle size={18} className="text-blue-500" /> Yeni Makina Ekle
            </h2>
            <form onSubmit={handleEkle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Makina No</label>
                  <input name="makinaNo" value={form.makinaNo} onChange={handleChange} placeholder="ör. MKN-001"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Makina Adı</label>
                  <input name="makinaAdi" value={form.makinaAdi} onChange={handleChange} placeholder="ör. CNC Torna"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Son Bakım Tarihi</label>
                  <input type="date" name="sonBakimTarihi" value={form.sonBakimTarihi} onChange={handleChange}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Bakım Periyodu (Gün)</label>
                  <input name="bakimPeriyoduGun" value={form.bakimPeriyoduGun} onChange={handleChange} placeholder="ör. 90" inputMode="numeric"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
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
            <Cpu size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">Henüz makina kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <Cpu size={18} className="text-blue-500" /> Makina Listesi
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} makina</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Makina No", "Makina Adı", "Durum", "Son Bakım", "Periyot", "Bakım Durumu", ...(isAdmin ? ["İşlem"] : [])].map((b) => (
                      <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liste.map((m, i) => {
                    const bakim = bakimDurumu(m);
                    return (
                      <tr key={m.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        <td className="px-5 py-3.5 text-blue-600 font-medium">{m.makinaNo}</td>
                        <td className="px-5 py-3.5 text-slate-800">{m.makinaAdi}</td>
                        <td className="px-5 py-3.5">
                          {isAdmin ? (
                            <button onClick={() => toggleDurum(m)}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                                m.durum === "aktif"
                                  ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200"
                                  : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                              }`}>
                              {m.durum === "aktif" ? "Aktif" : "Pasif"}
                            </button>
                          ) : (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              m.durum === "aktif" ? "text-emerald-600 bg-emerald-100" : "text-slate-500 bg-slate-100"
                            }`}>
                              {m.durum === "aktif" ? "Aktif" : "Pasif"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                          {m.sonBakimTarihi ? new Date(m.sonBakimTarihi).toLocaleDateString("tr-TR") : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                          {m.bakimPeriyoduGun ? `${m.bakimPeriyoduGun} gün` : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {bakim.mesaj ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                              bakim.uyari ? "text-amber-600 bg-amber-100" : "text-emerald-600 bg-emerald-100"
                            }`}>
                              {bakim.uyari && <AlertTriangle size={10} />}
                              {bakim.mesaj}
                            </span>
                          ) : "—"}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3.5">
                            <button onClick={() => handleSil(m.id)}
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
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
