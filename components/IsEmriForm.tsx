"use client";

import { useState, useEffect } from "react";
import { PlusCircle, CheckCircle2, AlertCircle, Factory, Cpu, Package, BarChart2, Banknote, Clock, Calendar } from "lucide-react";
import { getUrunler } from "@/lib/db";
import { apiGetMakinalar } from "@/lib/api";
import type { YeniIsEmri, Urun } from "@/data/types";

interface Props { onKaydet: (veri: YeniIsEmri) => void; }

interface FormState {
  isEmriNo: string; makinaNo: string; urunAdi: string;
  uretimAdedi: string; fireAdedi: string; hedefAdedi: string;
  birimFiyat: string; vardiya: string; tarih: string;
}

const BOSLUK: FormState = {
  isEmriNo: "", makinaNo: "", urunAdi: "", uretimAdedi: "", fireAdedi: "",
  hedefAdedi: "", birimFiyat: "", vardiya: "sabah",
  tarih: new Date().toISOString().split("T")[0],
};

function autoEmriNo() {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  const saat = String(now.getHours()).padStart(2,"0") + String(now.getMinutes()).padStart(2,"0");
  return `IE-${ymd}-${saat}`;
}

const INP = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all hover:border-slate-300";
const LABEL = "text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

export default function IsEmriForm({ onKaydet }: Props) {
  const [form, setForm]         = useState<FormState>({ ...BOSLUK, isEmriNo: autoEmriNo() });
  const [hata, setHata]         = useState("");
  const [urunler, setUrunler]   = useState<Urun[]>([]);
  const [makinalar, setMakinalar] = useState<{makinaNo: string; makinaAdi: string}[]>([]);
  const [onizleme, setOnizleme] = useState(false);

  useEffect(() => {
    getUrunler().then(setUrunler);
    apiGetMakinalar().then(list => setMakinalar(list.filter(m => m.durum === "aktif")));
  }, []);

  const uretim = parseInt(form.uretimAdedi, 10);
  const fire   = parseInt(form.fireAdedi,   10);
  const hedef  = parseInt(form.hedefAdedi,  10);
  const fiyat  = parseFloat(form.birimFiyat.replace(",", "."));

  const fireOrani    = uretim > 0 && fire >= 0 && !isNaN(fire) ? ((fire / (uretim + fire)) * 100).toFixed(1) : null;
  const verimlilik   = !isNaN(hedef) && hedef > 0 && !isNaN(uretim) && uretim > 0 ? Math.min(100, Math.round((uretim / hedef) * 100)) : null;
  const toplamDeger  = !isNaN(uretim) && !isNaN(fiyat) ? (uretim * fiyat).toLocaleString("tr-TR", { style:"currency", currency:"TRY" }) : null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleUrunSec(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = urunler.find(u => u.id === e.target.value);
    if (s) setForm(prev => ({ ...prev, urunAdi: s.urunAdi, birimFiyat: String(s.birimFiyat) }));
    else setForm(prev => ({ ...prev, urunAdi: "", birimFiyat: "" }));
  }

  function validate(): string {
    if (!form.isEmriNo.trim())                            return "İş emri numarası zorunludur.";
    if (!form.urunAdi.trim())                             return "Ürün adı zorunludur.";
    if (!form.uretimAdedi || isNaN(uretim) || uretim <= 0) return "Üretim adedi 0'dan büyük olmalıdır.";
    const f = isNaN(fire) ? 0 : fire;
    if (f < 0 || f > uretim)                             return "Fire adedi geçersiz (0 ile üretim adedi arasında olmalı).";
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setHata(err); return; }
    setHata("");
    setOnizleme(true);
  }

  function handleKaydet() {
    onKaydet({
      isEmriNo: form.isEmriNo.trim(), makinaNo: form.makinaNo.trim(),
      urunAdi: form.urunAdi.trim(), uretimAdedi: uretim, fireAdedi: isNaN(fire) ? 0 : fire,
      birimFiyat: isNaN(fiyat) ? 0 : fiyat,
      hedefAdedi: isNaN(hedef) ? undefined : hedef,
      vardiya: form.vardiya as "sabah" | "oglen" | "gece",
      tarih: form.tarih,
    });
    setForm({ ...BOSLUK, isEmriNo: autoEmriNo() });
    setOnizleme(false);
  }

  if (onizleme) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="font-semibold text-slate-700 text-sm">Kayıt Özeti — Onaylıyor musunuz?</span>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "İş Emri No",    deger: form.isEmriNo },
            { label: "Ürün",          deger: form.urunAdi },
            { label: "Makina",        deger: form.makinaNo || "—" },
            { label: "Üretim",        deger: `${uretim.toLocaleString("tr-TR")} adet` },
            { label: "Fire",          deger: `${isNaN(fire) ? 0 : fire} adet${fireOrani ? ` (%${fireOrani})` : ""}` },
            { label: "Hedef",         deger: !isNaN(hedef) && hedef > 0 ? `${hedef.toLocaleString("tr-TR")} adet${verimlilik !== null ? ` — %${verimlilik} verim` : ""}` : "—" },
            { label: "Birim Fiyat",   deger: !isNaN(fiyat) ? `${fiyat.toLocaleString("tr-TR")} ₺` : "—" },
            { label: "Toplam Değer",  deger: toplamDeger ?? "—" },
            { label: "Vardiya",       deger: form.vardiya === "sabah" ? "1. Vardiya (08:15–18:00)" : "2. Vardiya (18:00–02:00)" },
            { label: "Tarih",         deger: new Date(form.tarih).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" }) },
          ].map(({ label, deger }) => (
            <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
              <p className="text-slate-800 text-sm font-semibold mt-0.5">{deger}</p>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button onClick={() => setOnizleme(false)}
            className="px-5 py-2.5 text-slate-500 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
            Düzenle
          </button>
          <button onClick={handleKaydet}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <CheckCircle2 size={16} /> Onayla ve Kaydet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Başlık */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Factory size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-slate-800 font-semibold text-sm">Yeni Üretim Emri</h2>
            <p className="text-slate-400 text-xs mt-0.5">Tüm zorunlu alanları (*) doldurun</p>
          </div>
        </div>
        {verimlilik !== null && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${verimlilik >= 90 ? "bg-emerald-100 text-emerald-700" : verimlilik >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
            <BarChart2 size={12} />
            %{verimlilik} verimlilik
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Bölüm 1: Kimlik */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-slate-200 inline-block" />Kimlik Bilgileri<span className="flex-1 h-px bg-slate-200 inline-block" />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FieldWrapper label="İş Emri No" icon={<Factory size={13} />} required
              valid={form.isEmriNo.trim().length >= 3}>
              <input name="isEmriNo" value={form.isEmriNo} onChange={handleChange}
                placeholder="IE-20240605-0830" className={INP} />
            </FieldWrapper>

            <FieldWrapper label="Makina" icon={<Cpu size={13} />}>
              {makinalar.length > 0 ? (
                <select name="makinaNo" value={form.makinaNo} onChange={handleChange} className={INP}>
                  <option value="">— Makina Seç —</option>
                  {makinalar.map(m => (
                    <option key={m.makinaNo} value={m.makinaNo}>{m.makinaNo} — {m.makinaAdi}</option>
                  ))}
                </select>
              ) : (
                <input name="makinaNo" value={form.makinaNo} onChange={handleChange}
                  placeholder="ör. MK-03" className={INP} />
              )}
            </FieldWrapper>

            <FieldWrapper label="Ürün" icon={<Package size={13} />} required
              valid={form.urunAdi.trim().length > 0}>
              {urunler.length > 0 ? (
                <>
                  <select onChange={handleUrunSec} defaultValue="" className={INP}>
                    <option value="">— Ürün Seç —</option>
                    {urunler.map(u => <option key={u.id} value={u.id}>{u.urunKodu} — {u.urunAdi}</option>)}
                  </select>
                  {form.urunAdi && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={11} /> {form.urunAdi}
                    </p>
                  )}
                </>
              ) : (
                <input name="urunAdi" value={form.urunAdi} onChange={handleChange}
                  placeholder="ör. Mil Dişlisi" className={INP} />
              )}
            </FieldWrapper>
          </div>
        </div>

        {/* Bölüm 2: Üretim */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-slate-200 inline-block" />Üretim Rakamları<span className="flex-1 h-px bg-slate-200 inline-block" />
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FieldWrapper label="Üretim Adedi *" icon={<BarChart2 size={13} />}
              valid={!isNaN(uretim) && uretim > 0}>
              <input name="uretimAdedi" value={form.uretimAdedi} onChange={handleChange}
                inputMode="numeric" placeholder="0" className={INP} />
            </FieldWrapper>

            <FieldWrapper label="Fire Adedi" icon={<AlertCircle size={13} />}
              hint={fireOrani ? `%${fireOrani} fire oranı` : undefined}
              hintRenk={fireOrani && parseFloat(fireOrani) > 5 ? "text-amber-500" : "text-emerald-500"}>
              <input name="fireAdedi" value={form.fireAdedi} onChange={handleChange}
                inputMode="numeric" placeholder="0" className={INP} />
            </FieldWrapper>

            <FieldWrapper label="Hedef Adedi" icon={<BarChart2 size={13} />}
              hint={verimlilik !== null ? `%${verimlilik} verimlilik` : undefined}
              hintRenk={verimlilik !== null && verimlilik >= 90 ? "text-emerald-500" : verimlilik !== null && verimlilik >= 70 ? "text-amber-500" : "text-red-500"}>
              <input name="hedefAdedi" value={form.hedefAdedi} onChange={handleChange}
                inputMode="numeric" placeholder="0" className={INP} />
            </FieldWrapper>

            <FieldWrapper label="Birim Fiyat ₺" icon={<Banknote size={13} />}
              hint={toplamDeger ? `Toplam: ${toplamDeger}` : undefined}
              hintRenk="text-blue-500">
              <input name="birimFiyat" value={form.birimFiyat} onChange={handleChange}
                inputMode="decimal" placeholder="0,00" className={INP} />
            </FieldWrapper>
          </div>
        </div>

        {/* Bölüm 3: Zaman */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-slate-200 inline-block" />Zaman Bilgileri<span className="flex-1 h-px bg-slate-200 inline-block" />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrapper label="Vardiya" icon={<Clock size={13} />}>
              <div className="flex gap-2">
                {[
                  { val: "sabah", label: "1. Vardiya", sub: "08:15 – 18:00" },
                  { val: "oglen", label: "2. Vardiya", sub: "18:00 – 02:00" },
                ].map(v => (
                  <button type="button" key={v.val}
                    onClick={() => setForm(p => ({ ...p, vardiya: v.val }))}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-left transition-all ${form.vardiya === v.val ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}>
                    <p className={`text-xs font-semibold ${form.vardiya === v.val ? "text-blue-700" : "text-slate-600"}`}>{v.label}</p>
                    <p className={`text-[10px] mt-0.5 ${form.vardiya === v.val ? "text-blue-500" : "text-slate-400"}`}>{v.sub}</p>
                  </button>
                ))}
              </div>
            </FieldWrapper>

            <FieldWrapper label="Tarih" icon={<Calendar size={13} />} valid>
              <input type="date" name="tarih" value={form.tarih} onChange={handleChange} className={INP} />
            </FieldWrapper>
          </div>
        </div>

        {/* Hata */}
        {hata && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm animate-shake">
            <AlertCircle size={16} className="flex-shrink-0" /> {hata}
          </div>
        )}

        {/* Aksiyon */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button type="button" onClick={() => setForm({ ...BOSLUK, isEmriNo: autoEmriNo() })}
            className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
            Formu Temizle
          </button>
          <button type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
            <PlusCircle size={16} /> Önizle ve Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldWrapper({ label, icon, children, required, valid, hint, hintRenk }: {
  label: string; icon?: React.ReactNode; children: React.ReactNode;
  required?: boolean; valid?: boolean; hint?: string; hintRenk?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={LABEL}>
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
        {required && <span className="text-red-400">*</span>}
        {valid && <CheckCircle2 size={11} className="text-emerald-500 ml-auto" />}
      </label>
      {children}
      {hint && <p className={`text-[11px] font-medium ${hintRenk ?? "text-slate-400"}`}>{hint}</p>}
    </div>
  );
}
