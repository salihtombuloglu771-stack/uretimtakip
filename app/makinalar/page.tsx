"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard, { getRol } from "@/components/AuthGuard";
import { Wrench, PlusCircle, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Makina } from "@/data/types";

// Form state'i string tutar — submit anında parse edilir
interface MakinaFormState {
  makinaNo:         string;
  makinaAdi:        string;
  durum:            "aktif" | "pasif";
  sonBakimTarihi:   string;
  bakimPeriyoduGun: string;
}

const DEPO  = "uretim_makinalar";
const BOSLUK: MakinaFormState = {
  makinaNo: "", makinaAdi: "", durum: "aktif", sonBakimTarihi: "", bakimPeriyoduGun: "90",
};

export default function MakinalarSayfasi() {
  const [liste,   setListe]  = useState<Makina[]>([]);
  const [form,    setForm]   = useState(BOSLUK);
  const [hata,    setHata]   = useState("");
  const [loaded,  setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const veri = localStorage.getItem(DEPO);
    if (veri) try { setListe(JSON.parse(veri)); } catch {}
    setIsAdmin(getRol() === "admin");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(DEPO, JSON.stringify(liste));
  }, [liste, loaded]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.makinaNo.trim() || !form.makinaAdi.trim()) { setHata("Makina numarası ve adı zorunludur."); return; }
    if (liste.some((m) => m.makinaNo.toLowerCase() === form.makinaNo.trim().toLowerCase())) { setHata("Bu makina numarası zaten kayıtlı."); return; }
    setHata("");
    setListe((p) => [...p, {
      id: crypto.randomUUID(),
      makinaNo:         form.makinaNo.trim(),
      makinaAdi:        form.makinaAdi.trim(),
      durum:            form.durum as "aktif" | "pasif",
      sonBakimTarihi:   form.sonBakimTarihi || undefined,
      bakimPeriyoduGun: form.bakimPeriyoduGun ? parseInt(form.bakimPeriyoduGun) : undefined,
    }]);
    setForm(BOSLUK);
  }

  function toggleDurum(id: string) {
    setListe((p) => p.map((m) => m.id === id ? { ...m, durum: m.durum === "aktif" ? "pasif" : "aktif" } : m));
  }

  // Bakım durumu: gün olarak fark hesapla
  function bakimDurumu(makina: Makina): { renk: string; metin: string } | null {
    if (!makina.sonBakimTarihi || !makina.bakimPeriyoduGun) return null;
    const son    = new Date(makina.sonBakimTarihi);
    const simdi  = new Date();
    const gecen  = Math.floor((simdi.getTime() - son.getTime()) / 86400000);
    const kalan  = makina.bakimPeriyoduGun - gecen;
    if (kalan < 0)  return { renk: "text-red-600 bg-red-100",    metin: `${Math.abs(kalan)}g gecikti` };
    if (kalan <= 7) return { renk: "text-amber-600 bg-amber-100", metin: `${kalan}g kaldı` };
    return             { renk: "text-emerald-600 bg-emerald-100", metin: `${kalan}g kaldı` };
  }

  const aktifSayi      = liste.filter((m) => m.durum === "aktif").length;
  const bakimGereken   = liste.filter((m) => { const b = bakimDurumu(m); return b && b.renk.includes("red"); }).length;

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Makinalar</h1>
            <p className="text-slate-500 text-sm mt-0.5">Makina parkı ve bakım takibi</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Bakım uyarısı */}
        {bakimGereken > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">
              <span className="font-bold">{bakimGereken}</span> makina bakım süresi geçmiş!
            </p>
          </div>
        )}

        {/* Özet */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Toplam Makina", deger: liste.length,  renk: "text-blue-600",    border: "border-blue-100" },
            { label: "Aktif",         deger: aktifSayi,     renk: "text-emerald-600", border: "border-emerald-100" },
            { label: "Bakım Bekleyen",deger: bakimGereken,  renk: bakimGereken > 0 ? "text-red-500" : "text-slate-400", border: bakimGereken > 0 ? "border-red-100" : "border-slate-200" },
          ].map((k) => (
            <div key={k.label} className={`bg-white border ${k.border} rounded-xl p-5 shadow-sm`}>
              <p className="text-slate-500 text-xs uppercase tracking-wide">{k.label}</p>
              <p className={`${k.renk} text-3xl font-bold mt-1`}>{k.deger}</p>
            </div>
          ))}
        </div>

        {/* Ekle formu — sadece admin */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
              <PlusCircle size={18} className="text-blue-500" /> Yeni Makina Ekle
            </h2>
            <form onSubmit={handleEkle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Makina No", name: "makinaNo", placeholder: "ör. MK-03" },
                  { label: "Makina Adı", name: "makinaAdi", placeholder: "ör. CNC Torna" },
                  { label: "Bakım Periyodu (gün)", name: "bakimPeriyoduGun", placeholder: "90" },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">{f.label}</label>
                    <input name={f.name} value={(form as unknown as Record<string,string>)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Son Bakım Tarihi</label>
                  <input type="date" name="sonBakimTarihi" value={form.sonBakimTarihi} onChange={handleChange}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                  />
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
        )}

        {/* Liste */}
        {liste.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
            <Wrench size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">Henüz makina kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <Wrench size={18} className="text-blue-500" /> Makina Listesi
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} makina</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Makina No", "Makina Adı", "Durum", "Son Bakım", "Bakım Durumu", ...(isAdmin ? ["İşlem"] : [])].map((b) => (
                      <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liste.map((makina, i) => {
                    const bakim = bakimDurumu(makina);
                    return (
                      <tr key={makina.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        <td className="px-5 py-3.5 text-blue-600 font-medium">{makina.makinaNo}</td>
                        <td className="px-5 py-3.5 text-slate-800">{makina.makinaAdi}</td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => isAdmin && toggleDurum(makina.id)}
                            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                              makina.durum === "aktif"
                                ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200"
                                : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                            } ${!isAdmin ? "cursor-default" : ""}`}
                          >
                            {makina.durum === "aktif" ? <><CheckCircle size={12} /> Aktif</> : <><XCircle size={12} /> Pasif</>}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                          {makina.sonBakimTarihi
                            ? new Date(makina.sonBakimTarihi).toLocaleDateString("tr-TR")
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {bakim
                            ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bakim.renk}`}>{bakim.metin}</span>
                            : <span className="text-slate-400 text-xs">—</span>
                          }
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3.5">
                            <button onClick={() => setListe((p) => p.filter((m) => m.id !== makina.id))}
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
