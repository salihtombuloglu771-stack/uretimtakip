"use client";

import { apiAddMakina, apiDeleteMakina, apiGetMakinalar, apiUpdateMakinaDurum } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import PageLayout from "@/components/PageLayout";
import ConfirmModal from "@/components/ConfirmModal";
import AramaKutusu from "@/components/AramaKutusu";
import { useToast } from "@/components/Toast";
import { getRol } from "@/components/AuthGuard";
import { Cpu, PlusCircle, Trash2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { Makina } from "@/data/types";

interface FormState {
  makinaNo: string; makinaAdi: string; durum: "aktif" | "pasif";
  sonBakimTarihi: string; bakimPeriyoduGun: string;
}
const BOSLUK: FormState = { makinaNo: "", makinaAdi: "", durum: "aktif", sonBakimTarihi: "", bakimPeriyoduGun: "" };

function bakimDurumu(m: Makina): { uyari: boolean; mesaj: string } {
  if (!m.sonBakimTarihi || !m.bakimPeriyoduGun) return { uyari: false, mesaj: "" };
  const sonraki = new Date(m.sonBakimTarihi);
  sonraki.setDate(sonraki.getDate() + m.bakimPeriyoduGun);
  const kalan = Math.ceil((sonraki.getTime() - Date.now()) / 86400000);
  if (kalan <= 0)  return { uyari: true,  mesaj: `${Math.abs(kalan)} gün gecikmiş!` };
  if (kalan <= 7)  return { uyari: true,  mesaj: `${kalan} gün kaldı` };
  return { uyari: false, mesaj: `${kalan} gün kaldı` };
}

const INP = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all hover:border-slate-300";

export default function MakinalarPage() {
  const { toast } = useToast();
  const [liste,       setListe]       = useState<Makina[]>([]);
  const [form,        setForm]        = useState<FormState>(BOSLUK);
  const [formHata,    setFormHata]    = useState("");
  const [yukluyor,    setYukluyor]    = useState(true);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [arama,       setArama]       = useState("");
  const [silId,       setSilId]       = useState<string | null>(null);
  const [formAcik,    setFormAcik]    = useState(false);

  const yukle = useCallback(async () => {
    setYukluyor(true);
    try {
      setListe(await apiGetMakinalar());
    } finally {
      setYukluyor(false);
    }
  }, []);

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    yukle();
  }, [yukle]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.makinaNo.trim() || !form.makinaAdi.trim()) { setFormHata("Makina no ve adı zorunlu."); return; }
    if (liste.some(m => m.makinaNo.toLowerCase() === form.makinaNo.trim().toLowerCase())) {
      setFormHata("Bu makina numarası zaten kayıtlı."); return;
    }
    setFormHata("");
    const periyot = parseInt(form.bakimPeriyoduGun, 10);
    try {
      const { id } = await apiAddMakina({
        makinaNo: form.makinaNo.trim(), makinaAdi: form.makinaAdi.trim(), durum: form.durum,
        sonBakimTarihi: form.sonBakimTarihi || undefined,
        bakimPeriyoduGun: isNaN(periyot) ? undefined : periyot,
      });
      setListe(p => [...p, { id, makinaNo: form.makinaNo.trim(), makinaAdi: form.makinaAdi.trim(), durum: form.durum, sonBakimTarihi: form.sonBakimTarihi || undefined, bakimPeriyoduGun: isNaN(periyot) ? undefined : periyot }]);
      setForm(BOSLUK);
      setFormAcik(false);
      toast(`${form.makinaNo.trim()} eklendi.`, "basari");
    } catch { toast("Eklenemedi, tekrar deneyin.", "hata"); }
  }

  async function toggleDurum(m: Makina) {
    const yeni = m.durum === "aktif" ? "pasif" : "aktif";
    await apiUpdateMakinaDurum(m.id, yeni);
    setListe(p => p.map(x => x.id === m.id ? { ...x, durum: yeni } : x));
    toast(`${m.makinaNo} → ${yeni}`, "bilgi");
  }

  async function handleSil() {
    if (!silId) return;
    const m = liste.find(x => x.id === silId);
    try {
      await apiDeleteMakina(silId);
      setListe(p => p.filter(x => x.id !== silId));
      toast(`${m?.makinaNo ?? "Makina"} silindi.`, "basari");
    } catch { toast("Silinemedi.", "hata"); }
    finally { setSilId(null); }
  }

  const filtreli = liste.filter(m =>
    arama === "" ||
    m.makinaNo.toLowerCase().includes(arama.toLowerCase()) ||
    m.makinaAdi.toLowerCase().includes(arama.toLowerCase())
  );

  const aktifSayi = liste.filter(m => m.durum === "aktif").length;
  const uyariSayi = liste.filter(m => bakimDurumu(m).uyari).length;

  return (
    <PageLayout
      baslik="Makinalar"
      altyazi="Makina parkı ve bakım takibi"
      yenile={yukle}
      yukleniyor={yukluyor}
      sagIcerik={
        <AramaKutusu deger={arama} onChange={setArama} placeholder="Makina ara…" className="w-48" />
      }
    >
      {/* Özet */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam",        deger: liste.length,  renk: "text-blue-600",   sinir: "border-blue-100" },
          { label: "Aktif",         deger: aktifSayi,     renk: "text-emerald-600", sinir: "border-emerald-100" },
          { label: "Bakım Uyarısı", deger: uyariSayi,     renk: uyariSayi > 0 ? "text-amber-500" : "text-slate-400", sinir: uyariSayi > 0 ? "border-amber-200" : "border-slate-200" },
        ].map(({ label, deger, renk, sinir }) => (
          <div key={label} className={`bg-white border ${sinir} rounded-xl p-5 shadow-sm`}>
            <p className="text-slate-500 text-xs uppercase tracking-wide">{label}</p>
            <p className={`${renk} text-3xl font-bold mt-1`}>{deger}</p>
          </div>
        ))}
      </div>

      {/* Form açma/kapama */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button onClick={() => setFormAcik(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <PlusCircle size={17} className="text-blue-500" /> Yeni Makina Ekle
            </span>
            {formAcik ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {formAcik && (
            <div className="px-6 pb-6 border-t border-slate-100 animate-fade-in-up">
              <form onSubmit={handleEkle} className="space-y-5 pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Makina No *</label>
                    <input name="makinaNo" value={form.makinaNo} onChange={handleChange}
                      placeholder="ör. MKN-001" className={INP} />
                    <p className="text-[11px] text-slate-400">Benzersiz makina kimlik kodu</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Makina Adı *</label>
                    <input name="makinaAdi" value={form.makinaAdi} onChange={handleChange}
                      placeholder="ör. CNC Torna T400" className={INP} />
                    <p className="text-[11px] text-slate-400">Marka, model veya tanımlayıcı isim</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Başlangıç Durumu</label>
                    <div className="flex gap-2">
                      {([{ val:"aktif", label:"Aktif", cls:"border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100" },
                         { val:"pasif", label:"Pasif", cls:"border-slate-400 bg-slate-50 text-slate-600 ring-2 ring-slate-100" }
                      ] as const).map(d => (
                        <button key={d.val} type="button"
                          onClick={() => setForm(p => ({ ...p, durum: d.val }))}
                          className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${form.durum === d.val ? d.cls : "border-slate-200 text-slate-400 hover:border-slate-300"}`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Son Bakım Tarihi</label>
                    <input type="date" name="sonBakimTarihi" value={form.sonBakimTarihi} onChange={handleChange} className={INP} />
                    <p className="text-[11px] text-slate-400">Bir sonraki bakım bu tarihten hesaplanır</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Bakım Periyodu (Gün)</label>
                    <div className="relative">
                      <input name="bakimPeriyoduGun" value={form.bakimPeriyoduGun} onChange={handleChange}
                        placeholder="ör. 90" inputMode="numeric" className={INP + " pr-16"} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">gün</span>
                    </div>
                  </div>
                </div>
                {formHata && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-shake">
                    <AlertTriangle size={15} className="flex-shrink-0" /> {formHata}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setFormAcik(false)}
                    className="px-5 py-2.5 text-slate-500 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">İptal</button>
                  <button type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
                    <PlusCircle size={15} /> Makina Ekle
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Liste */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
            <Cpu size={16} className="text-blue-500" /> Makina Listesi
          </h2>
          <span className="text-slate-400 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{filtreli.length} / {liste.length}</span>
        </div>
        {yukluyor ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtreli.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-slate-300">
            <Cpu size={40} />
            <p className="text-slate-400 text-sm">{arama ? "Aramanızla eşleşen makina yok." : "Henüz makina kaydı yok."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Makina No", "Makina Adı", "Durum", "Son Bakım", "Periyot", "Bakım Durumu", ...(isAdmin ? [""] : [])].map(b => (
                    <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtreli.map((m, i) => {
                  const bakim = bakimDurumu(m);
                  return (
                    <tr key={m.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 ? "bg-slate-50/40" : ""}`}>
                      <td className="px-5 py-3.5 text-blue-600 font-medium">{m.makinaNo}</td>
                      <td className="px-5 py-3.5 text-slate-800">{m.makinaAdi}</td>
                      <td className="px-5 py-3.5">
                        {isAdmin ? (
                          <button onClick={() => toggleDurum(m)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${m.durum === "aktif" ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200" : "text-slate-500 bg-slate-100 hover:bg-slate-200"}`}>
                            {m.durum === "aktif" ? "Aktif" : "Pasif"}
                          </button>
                        ) : (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m.durum === "aktif" ? "text-emerald-600 bg-emerald-100" : "text-slate-500 bg-slate-100"}`}>
                            {m.durum === "aktif" ? "Aktif" : "Pasif"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {m.sonBakimTarihi ? new Date(m.sonBakimTarihi).toLocaleDateString("tr-TR") : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{m.bakimPeriyoduGun ? `${m.bakimPeriyoduGun} gün` : "—"}</td>
                      <td className="px-5 py-3.5">
                        {bakim.mesaj ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${bakim.uyari ? "text-amber-600 bg-amber-100" : "text-emerald-600 bg-emerald-100"}`}>
                            {bakim.uyari && <AlertTriangle size={10} />}{bakim.mesaj}
                          </span>
                        ) : "—"}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <button onClick={() => setSilId(m.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
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
        )}
      </div>

      <ConfirmModal
        acik={silId !== null}
        mesaj={`${liste.find(m => m.id === silId)?.makinaNo ?? "Makina"} silinecek. Geri alınamaz.`}
        onOnayla={handleSil}
        onIptal={() => setSilId(null)}
      />
    </PageLayout>
  );
}
