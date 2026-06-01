"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import type { YeniIsEmri, Urun } from "@/data/types";

interface Props {
  onKaydet: (veri: YeniIsEmri) => void;
}

interface FormState {
  isEmriNo:    string;
  makinaNo:    string;
  urunAdi:     string;
  uretimAdedi: string;
  fireAdedi:   string;
  hedefAdedi:  string;
  birimFiyat:  string;
  vardiya:     string;
  tarih:       string;
}

const BOSLUK: FormState = {
  isEmriNo:    "",
  makinaNo:    "",
  urunAdi:     "",
  uretimAdedi: "",
  fireAdedi:   "",
  hedefAdedi:  "",
  birimFiyat:  "",
  vardiya:     "sabah",
  tarih: new Date().toISOString().split("T")[0],
};

export default function IsEmriForm({ onKaydet }: Props) {
  const [form,    setForm]    = useState<FormState>(BOSLUK);
  const [hata,    setHata]    = useState("");
  const [urunler, setUrunler] = useState<Urun[]>([]);

  // Ürün kataloğunu localStorage'dan yükle
  useEffect(() => {
    const veri = localStorage.getItem("uretim_urunler");
    if (veri) try { setUrunler(JSON.parse(veri)); } catch {}
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Ürün seçilince adı ve fiyatı otomatik doldur
  function handleUrunSec(e: React.ChangeEvent<HTMLSelectElement>) {
    const secilen = urunler.find((u) => u.id === e.target.value);
    if (secilen) {
      setForm((prev) => ({
        ...prev,
        urunAdi:    secilen.urunAdi,
        birimFiyat: String(secilen.birimFiyat),
      }));
    } else {
      setForm((prev) => ({ ...prev, urunAdi: "", birimFiyat: "" }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uretim = parseInt(form.uretimAdedi, 10);
    const fire   = parseInt(form.fireAdedi,   10);
    const hedef  = parseInt(form.hedefAdedi,  10);
    const fiyat  = parseFloat(form.birimFiyat.replace(",", "."));

    if (!form.isEmriNo.trim() || !form.urunAdi.trim()) {
      setHata("İş emri numarası ve ürün adı zorunludur.");
      return;
    }
    if (!form.uretimAdedi || isNaN(uretim) || uretim <= 0) {
      setHata("Üretim adedi 0'dan büyük olmalıdır.");
      return;
    }
    const fireAdedi = isNaN(fire) ? 0 : fire;
    if (fireAdedi < 0 || fireAdedi > uretim) {
      setHata("Fire adedi geçersiz.");
      return;
    }

    setHata("");
    onKaydet({
      isEmriNo:    form.isEmriNo.trim(),
      makinaNo:    form.makinaNo.trim(),
      urunAdi:     form.urunAdi.trim(),
      uretimAdedi: uretim,
      fireAdedi,
      birimFiyat:  isNaN(fiyat) ? 0 : fiyat,
      hedefAdedi:  isNaN(hedef) ? undefined : hedef,
      vardiya:     form.vardiya as "sabah" | "oglen" | "gece",
      tarih:       form.tarih,
    });
    setForm(BOSLUK);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
        <PlusCircle size={18} className="text-blue-500" />
        Yeni İş Emri Kaydı
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Satır 1: İş Emri No, Makina No, Ürün */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputAlani label="İş Emri Numarası" name="isEmriNo" placeholder="ör. IE-2024-001" value={form.isEmriNo} onChange={handleChange} />
          <InputAlani label="Makina Numarası"  name="makinaNo" placeholder="ör. MK-03"       value={form.makinaNo} onChange={handleChange} />

          {/* Ürün: katalog varsa dropdown, yoksa text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Ürün Adı</label>
            {urunler.length > 0 ? (
              <select
                onChange={handleUrunSec}
                defaultValue=""
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              >
                <option value="">— Ürün Seç —</option>
                {urunler.map((u) => (
                  <option key={u.id} value={u.id}>{u.urunKodu} — {u.urunAdi}</option>
                ))}
              </select>
            ) : (
              <input name="urunAdi" value={form.urunAdi} onChange={handleChange} placeholder="ör. Mil Dişlisi"
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            )}
            {/* Seçili ürün adını göster */}
            {urunler.length > 0 && form.urunAdi && (
              <p className="text-xs text-slate-500">Seçili: <span className="font-medium text-slate-700">{form.urunAdi}</span></p>
            )}
          </div>
        </div>

        {/* Satır 2: Üretim, Fire, Hedef, Birim Fiyat */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InputAlani label="Üretim Adedi"  name="uretimAdedi" inputMode="numeric" placeholder="Adet"  value={form.uretimAdedi} onChange={handleChange} />
          <InputAlani label="Fire Adedi"    name="fireAdedi"   inputMode="numeric" placeholder="Adet"  value={form.fireAdedi}   onChange={handleChange} />
          <InputAlani label="Hedef Adedi"   name="hedefAdedi"  inputMode="numeric" placeholder="Adet"  value={form.hedefAdedi}  onChange={handleChange} />
          <InputAlani label="Birim Fiyat ₺" name="birimFiyat"  inputMode="decimal" placeholder="0.00" value={form.birimFiyat}  onChange={handleChange} />
        </div>

        {/* Satır 3: Vardiya + Tarih */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Vardiya</label>
            <select name="vardiya" value={form.vardiya} onChange={handleChange}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            >
              <option value="sabah">🌅 Sabah (06:00–14:00)</option>
              <option value="oglen">☀️ Öğlen (14:00–22:00)</option>
              <option value="gece">🌙 Gece (22:00–06:00)</option>
            </select>
          </div>
          <InputAlani label="Tarih" name="tarih" type="date" value={form.tarih} onChange={handleChange} />
        </div>

        {hata && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>
        )}

        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
            <PlusCircle size={16} /> Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

interface InputAlaniProps {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
}

function InputAlani({ label, name, value, onChange, type = "text", inputMode, placeholder }: InputAlaniProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} inputMode={inputMode} placeholder={placeholder}
        className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
    </div>
  );
}
