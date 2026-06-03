"use client";


import { apiAddMalzeme, apiDeleteMalzeme, apiGetMalzemeler, apiUpdateFotograf } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { getRol } from "@/components/AuthGuard";
import { Layers, PlusCircle, Trash2, Download, Upload, AlertCircle, Camera, X } from "lucide-react";
import * as XLSX from "xlsx";
import type { Malzeme } from "@/data/types";


interface FormState {
  malzemeKodu: string; malzemeAdi: string; birim: string;
  stokMiktari: string; birimFiyat: string;
}

const BOSLUK: FormState = {
  malzemeKodu: "", malzemeAdi: "", birim: "adet", stokMiktari: "", birimFiyat: "",
};

export default function MalzemePage() {
  const [liste,       setListe]       = useState<Malzeme[]>([]);
  const [form,        setForm]        = useState<FormState>(BOSLUK);
  const [hata,        setHata]        = useState("");
  const [loading,     setLoading]     = useState(true);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [importBilgi,  setImportBilgi]  = useState("");
  const [formAcik,     setFormAcik]     = useState(false);
  const [formFotograf, setFormFotograf] = useState<string | null>(null);
  const [fotografModal, setFotografModal] = useState<string | null>(null);
  const dosyaRef   = useRef<HTMLInputElement>(null);
  const kameraRef  = useRef<HTMLInputElement>(null);
  const satirKameraRef = useRef<HTMLInputElement>(null);
  const [satirKameraId, setSatirKameraId] = useState<string | null>(null);
  const formRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAdmin(getRol() === "admin");
    apiGetMalzemeler().then((data) => { setListe(data); setLoading(false); });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.malzemeKodu.trim() || !form.malzemeAdi.trim()) {
      setHata("Malzeme kodu ve adı zorunludur."); return;
    }
    if (liste.some((m) => m.malzemeKodu.toLowerCase() === form.malzemeKodu.trim().toLowerCase())) {
      setHata("Bu malzeme kodu zaten kayıtlı."); return;
    }
    const stok  = parseFloat(form.stokMiktari.replace(",", "."));
    const fiyat = parseFloat(form.birimFiyat.replace(",", "."));
    setHata("");
    const yeni: Omit<Malzeme, "id"> = {
      malzemeKodu: form.malzemeKodu.trim(),
      malzemeAdi:  form.malzemeAdi.trim(),
      birim:       form.birim.trim() || "adet",
      stokMiktari: isNaN(stok) ? 0 : stok,
      birimFiyat:  isNaN(fiyat) ? undefined : fiyat,
      fotograf:    formFotograf ?? undefined,
    };
    const { id } = await apiAddMalzeme(yeni);
    setListe((p) => [...p, { ...yeni, id }]);
    setForm(BOSLUK);
    setFormFotograf(null);
    setFormAcik(false);
  }

  function handleFormAc() {
    setFormAcik(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function handleFormFotograf(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    const reader = new FileReader();
    reader.onload = () => setFormFotograf(reader.result as string);
    reader.readAsDataURL(dosya);
    if (kameraRef.current) kameraRef.current.value = "";
  }

  async function handleSatirFotograf(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya || !satirKameraId) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await apiUpdateFotograf(satirKameraId, base64);
      setListe((p) => p.map((m) => m.id === satirKameraId ? { ...m, fotograf: base64 } : m));
      setSatirKameraId(null);
    };
    reader.readAsDataURL(dosya);
    if (satirKameraRef.current) satirKameraRef.current.value = "";
  }

  async function handleSil(id: string) {
    await apiDeleteMalzeme(id);
    setListe((p) => p.filter((m) => m.id !== id));
  }

  // ── Excel'e Aktar ──────────────────────────────────────────────────────────
  function handleExcelExport() {
    const ws = XLSX.utils.json_to_sheet(
      liste.map((m) => ({
        "Malzeme Kodu":  m.malzemeKodu,
        "Malzeme Adı":   m.malzemeAdi,
        "Birim":         m.birim,
        "Stok Miktarı":  m.stokMiktari,
        "Birim Fiyat":   m.birimFiyat ?? "",
        "Stok Değeri":   m.stokMiktari * (m.birimFiyat ?? 0),
      }))
    );
    // Sütun genişliklerini ayarla
    ws["!cols"] = [{ wch: 16 }, { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Malzemeler");
    XLSX.writeFile(wb, "nexplan_malzeme.xlsx");
  }

  // ── Dosyadan İçe Aktar ─────────────────────────────────────────────────────
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const wb     = XLSX.read(buffer, { type: "array" });
    const ws     = wb.Sheets[wb.SheetNames[0]];
    const rows   = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);

    let eklenen = 0;
    let atlanan = 0;

    for (const row of rows) {
      const kod  = String(row["Malzeme Kodu"] ?? row["malzeme_kodu"] ?? "").trim();
      const adi  = String(row["Malzeme Adı"]  ?? row["malzeme_adi"]  ?? "").trim();
      const birim = String(row["Birim"] ?? row["birim"] ?? "adet").trim();
      const stok  = parseFloat(String(row["Stok Miktarı"] ?? row["stok_miktari"] ?? "0").replace(",", "."));
      const fiyat = parseFloat(String(row["Birim Fiyat"]  ?? row["birim_fiyat"]  ?? "").replace(",", "."));

      if (!kod || !adi) { atlanan++; continue; }
      if (liste.some((m) => m.malzemeKodu.toLowerCase() === kod.toLowerCase())) { atlanan++; continue; }

      const yeni: Omit<Malzeme, "id"> = {
        malzemeKodu: kod, malzemeAdi: adi, birim: birim || "adet",
        stokMiktari: isNaN(stok) ? 0 : stok,
        birimFiyat:  isNaN(fiyat) ? undefined : fiyat,
      };
      const { id } = await apiAddMalzeme(yeni);
      setListe((p) => [...p, { ...yeni, id }]);
      eklenen++;
    }

    setImportBilgi(`${eklenen} malzeme eklendi${atlanan > 0 ? `, ${atlanan} satır atlandı` : ""}.`);
    setTimeout(() => setImportBilgi(""), 5000);
    if (dosyaRef.current) dosyaRef.current.value = "";
  }

  const toplamDeger = liste.reduce((t, m) => t + m.stokMiktari * (m.birimFiyat ?? 0), 0);

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
    {/* Gizli kamera inputları */}
    <input ref={kameraRef} type="file" accept="image/*" capture="environment"
      className="hidden" onChange={handleFormFotograf} />
    <input ref={satirKameraRef} type="file" accept="image/*" capture="environment"
      className="hidden" onChange={handleSatirFotograf} />

    {/* Fotoğraf büyütme modalı */}
    {fotografModal && (
      <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
        onClick={() => setFotografModal(null)}>
        <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotografModal} alt="Malzeme Fotoğrafı" className="w-full rounded-xl shadow-2xl object-contain max-h-[80vh]" />
          <button onClick={() => setFotografModal(null)}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
      </div>
    )}

    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Malzeme</h1>
            <p className="text-slate-500 text-sm mt-0.5">Malzeme kataloğu ve stok takibi</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Malzeme</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
          <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Stok Değeri</p>
            <p className="text-violet-600 text-3xl font-bold mt-1">
              {toplamDeger.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
            </p>
          </div>
        </div>

        {/* Import bildirimi */}
        {importBilgi && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
            <AlertCircle size={16} className="text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-700 text-sm font-medium">{importBilgi}</p>
          </div>
        )}

        {/* Form — toggle ile açılır */}
        {formAcik && (
          <div ref={formRef} className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <PlusCircle size={18} className="text-emerald-500" /> Yeni Malzeme Ekle
              </h2>
              <button onClick={() => { setFormAcik(false); setHata(""); setForm(BOSLUK); setFormFotograf(null); }}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none px-1">✕</button>
            </div>
            <form onSubmit={handleEkle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Malzeme Kodu", name: "malzemeKodu", placeholder: "ör. MLZ-001" },
                  { label: "Malzeme Adı",  name: "malzemeAdi",  placeholder: "ör. Çelik Profil" },
                  { label: "Birim",        name: "birim",        placeholder: "adet / kg / m" },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">{f.label}</label>
                    <input name={f.name} value={(form as unknown as Record<string, string>)[f.name]}
                      onChange={handleChange} placeholder={f.placeholder}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Stok Miktarı",  name: "stokMiktari", placeholder: "0" },
                  { label: "Birim Fiyat ₺", name: "birimFiyat",  placeholder: "0.00" },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">{f.label}</label>
                    <input name={f.name} value={(form as unknown as Record<string, string>)[f.name]} inputMode="decimal"
                      onChange={handleChange} placeholder={f.placeholder}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                  </div>
                ))}
              </div>
              {/* Fotoğraf */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Fotoğraf (opsiyonel)</label>
                {formFotograf ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-violet-200 bg-slate-50 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formFotograf} alt="Önizleme" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button type="button" onClick={() => kameraRef.current?.click()}
                        className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center">
                        <Camera size={13} />
                      </button>
                      <button type="button" onClick={() => setFormFotograf(null)}
                        className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => kameraRef.current?.click()}
                    className="w-32 h-20 border-2 border-dashed border-violet-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-violet-400 hover:bg-violet-50 transition-colors">
                    <Camera size={20} />
                    <span className="text-xs">Fotoğraf çek</span>
                  </button>
                )}
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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
              <Layers size={18} className="text-blue-500" /> Malzeme Listesi
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} malzeme</span>

              {/* Excel'e Aktar */}
              {liste.length > 0 && (
                <button onClick={handleExcelExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors">
                  <Download size={13} /> Excel&apos;e Aktar
                </button>
              )}

              {/* Dosyadan İçe Aktar — sadece admin */}
              {isAdmin && (
                <>
                  <button onClick={() => dosyaRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">
                    <Upload size={13} /> Dosyadan Aktar
                  </button>
                  <input
                    ref={dosyaRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                    onChange={handleImport}
                  />
                </>
              )}
            </div>
          </div>

          {liste.length === 0 ? (
            <div className="px-6 py-12 flex flex-col items-center gap-3">
              <Layers size={40} className="text-slate-200" />
              <p className="text-slate-500 text-sm">Henüz malzeme kaydı yok.</p>
              {isAdmin && (
                <p className="text-slate-400 text-xs text-center">
                  Formu kullanarak tek tek ekleyebilir<br />ya da Excel/CSV dosyası yükleyebilirsin.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Foto", "Malzeme Kodu", "Malzeme Adı", "Birim", "Stok Miktarı", "Birim Fiyat", "Stok Değeri", ""].map((b) => (
                      <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium whitespace-nowrap">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liste.map((m, i) => {
                    const deger = m.stokMiktari * (m.birimFiyat ?? 0);
                    return (
                      <tr key={m.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                        {/* Fotoğraf */}
                        <td className="px-3 py-2.5">
                          {m.fotograf ? (
                            <button onClick={() => setFotografModal(m.fotograf!)}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-violet-300 transition-colors flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={m.fotograf} alt={m.malzemeAdi} className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <button
                              onClick={() => { setSatirKameraId(m.id); setTimeout(() => satirKameraRef.current?.click(), 50); }}
                              className="w-10 h-10 rounded-lg border border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 flex items-center justify-center text-slate-300 hover:text-violet-400 transition-colors"
                              title="Fotoğraf ekle">
                              <Camera size={14} />
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-blue-600 font-medium">{m.malzemeKodu}</td>
                        <td className="px-5 py-3.5 text-slate-800">{m.malzemeAdi}</td>
                        <td className="px-5 py-3.5 text-slate-500">{m.birim}</td>
                        <td className="px-5 py-3.5 text-slate-800 font-medium">{m.stokMiktari.toLocaleString("tr-TR")}</td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {m.birimFiyat != null ? m.birimFiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-violet-700 font-medium">
                          {deger > 0 ? deger.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            {m.fotograf && (
                              <button
                                onClick={() => { setSatirKameraId(m.id); setTimeout(() => satirKameraRef.current?.click(), 50); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-colors"
                                title="Fotoğrafı değiştir">
                                <Camera size={14} />
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleSil(m.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Import şablonu bilgisi */}
        {isAdmin && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-slate-500 text-xs font-medium mb-1">Excel/CSV şablonu sütun başlıkları:</p>
            <p className="text-slate-400 text-xs font-mono">
              Malzeme Kodu | Malzeme Adı | Birim | Stok Miktarı | Birim Fiyat
            </p>
          </div>
        )}

      </main>
    </div>

    {/* Floating yeşil + butonu — herkes görebilir */}
    {!formAcik && (
      <button
        onClick={handleFormAc}
        title="Yeni Malzeme Ekle"
        className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 z-50"
      >
        <PlusCircle size={26} />
      </button>
    )}

    </AuthGuard>
  );
}
