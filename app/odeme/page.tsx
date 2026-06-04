"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PAKETLER: Record<string, { ad: string; fiyat: number; ozellikler: string[] }> = {
  başlangıç: { ad: "Başlangıç", fiyat: 99900, ozellikler: ["5 kullanıcı", "Temel modüller", "E-posta destek"] },
  pro:       { ad: "Pro",       fiyat: 249900, ozellikler: ["20 kullanıcı", "Tüm modüller", "Raporlar", "Öncelikli destek"] },
  kurumsal:  { ad: "Kurumsal",  fiyat: 499900, ozellikler: ["Sınırsız kullanıcı", "Özel geliştirme", "7/24 destek"] },
};

function OdemeIcerigi() {
  const params     = useSearchParams();
  const router     = useRouter();
  const iframeRef  = useRef<HTMLDivElement>(null);

  const paketAd = params.get("paket") ?? "pro";
  const paket   = PAKETLER[paketAd] ?? PAKETLER.pro;

  const [form, setForm] = useState({
    ad: "", soyad: "", email: "", tel: "",
    firma: "", adres: "", il: "", posta: "",
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [iyzFormHtml, setIyzFormHtml] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  async function handleOde(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch("/api/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paket: paketAd, tutar: paket.fiyat }),
      });
      const data = await res.json();
      if (data.hata) throw new Error(data.hata);
      if (data.checkoutFormContent) {
        setIyzFormHtml(data.checkoutFormContent);
      } else if (data.paymentPageUrl) {
        window.location.href = data.paymentPageUrl;
      }
    } catch (err: unknown) {
      setHata((err as Error).message ?? "Ödeme başlatılamadı.");
    } finally {
      setYukleniyor(false);
    }
  }

  // iyzico checkout formu HTML'ini enjekte et
  useEffect(() => {
    if (!iyzFormHtml || !iframeRef.current) return;
    iframeRef.current.innerHTML = iyzFormHtml;
    const scripts = iframeRef.current.querySelectorAll("script");
    scripts.forEach(s => {
      const newScript = document.createElement("script");
      if (s.src) newScript.src = s.src;
      else newScript.textContent = s.textContent;
      document.body.appendChild(newScript);
    });
  }, [iyzFormHtml]);

  const inputClass = "w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder-slate-400";

  if (iyzFormHtml) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
          <h2 className="text-slate-800 font-bold text-lg mb-4 text-center">Güvenli Ödeme</h2>
          <div ref={iframeRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors text-sm">
            <ArrowLeft size={16} /> Ana Sayfa
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-bold text-slate-800">NexPlan</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <Lock size={14} /> Güvenli Ödeme
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">

        {/* Sol: Form */}
        <div className="md:col-span-3">
          <h1 className="text-slate-800 text-2xl font-bold mb-6">Sipariş Bilgileri</h1>
          <form onSubmit={handleOde} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Ad</label>
                <input name="ad" required value={form.ad} onChange={handleChange} placeholder="Ahmet" className={inputClass} />
              </div>
              <div>
                <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Soyad</label>
                <input name="soyad" required value={form.soyad} onChange={handleChange} placeholder="Yılmaz" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">E-posta</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="ahmet@firma.com" className={inputClass} />
              <p className="text-slate-400 text-xs mt-1">Giriş bilgileriniz bu adrese gönderilecek.</p>
            </div>

            <div>
              <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Telefon</label>
              <input name="tel" type="tel" required value={form.tel} onChange={handleChange} placeholder="05551234567" className={inputClass} />
            </div>

            <div>
              <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Firma Adı</label>
              <input name="firma" required value={form.firma} onChange={handleChange} placeholder="ABC Üretim A.Ş." className={inputClass} />
            </div>

            <div>
              <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Adres</label>
              <input name="adres" required value={form.adres} onChange={handleChange} placeholder="Mahalle, Cadde, No" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">İl</label>
                <input name="il" required value={form.il} onChange={handleChange} placeholder="İstanbul" className={inputClass} />
              </div>
              <div>
                <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Posta Kodu</label>
                <input name="posta" value={form.posta} onChange={handleChange} placeholder="34000" className={inputClass} />
              </div>
            </div>

            {hata && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">{hata}</div>
            )}

            <button type="submit" disabled={yukleniyor}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base mt-2">
              {yukleniyor
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><CreditCard size={18} /> Ödemeye Geç</>
              }
            </button>

            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Lock size={12} /> SSL Şifreli</div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs"><ShieldCheck size={12} /> iyzico Güvenceli</div>
            </div>
          </form>
        </div>

        {/* Sağ: Sipariş özeti */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6 shadow-sm">
            <h2 className="text-slate-800 font-bold text-base mb-5">Sipariş Özeti</h2>

            <div className="bg-blue-50 rounded-xl p-4 mb-5">
              <p className="text-blue-600 font-bold text-lg">{paket.ad} Paketi</p>
              <p className="text-blue-400 text-sm mt-0.5">Aylık abonelik</p>
            </div>

            <ul className="space-y-2.5 mb-5">
              {paket.ozellikler.map(o => (
                <li key={o} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> {o}
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Aylık tutar</span>
                <span>₺{(paket.fiyat / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>KDV (%20)</span>
                <span>Dahil</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold text-base pt-1 border-t border-slate-100">
                <span>Toplam</span>
                <span>₺{(paket.fiyat / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs text-center mt-4">
              30 gün para iade garantisi. İstediğin zaman iptal.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function OdemePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <OdemeIcerigi />
    </Suspense>
  );
}
