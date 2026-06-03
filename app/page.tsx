"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClipboardList, Wrench, ShieldCheck, Layers,
  BarChart2, MessageSquare, Users, Play,
  CheckCircle, ArrowRight, Star, Phone, Mail,
  Package, Building, PauseCircle,
} from "lucide-react";

const OZELLIKLER = [
  { ikon: ClipboardList, baslik: "İş Emri Yönetimi",    aciklama: "Üretim emirlerini oluştur, takip et, raporla. Hedef vs gerçekleşen karşılaştırması." },
  { ikon: Wrench,        baslik: "Makina Takibi",        aciklama: "Makina parkını yönet, bakım tarihlerini takip et, arıza uyarıları al." },
  { ikon: ShieldCheck,   baslik: "Kalite Kontrol",       aciklama: "Her üretim emrini kalite kontrolden geçir, uygun/uygunsuz adet kaydet." },
  { ikon: Layers,        baslik: "Malzeme Yönetimi",     aciklama: "Stok takibi, Excel import/export, fotoğraflı malzeme kartı, barkod desteği." },
  { ikon: Package,       baslik: "Depo Hareketleri",     aciklama: "Sevkiyat ve üretim deposu ayrı takip. Giriş/çıkış hareketleri, stok durumu." },
  { ikon: Play,          baslik: "Operasyon Takibi",     aciklama: "Üretim başlat/durdur, gerçek zamanlı süre takibi, operatör verimliliği." },
  { ikon: PauseCircle,   baslik: "Duruş Kaydı",          aciklama: "Arıza, bakım, malzeme yokluğu gibi duruşları kaydet ve analiz et." },
  { ikon: Building,      baslik: "Sabit Kıymet",         aciklama: "Demirbaş listesi, alış tarihi, konum ve durum takibi." },
  { ikon: Users,         baslik: "Yetkilendirme",        aciklama: "Admin ve operatör rolleri. Her kullanıcı sadece yetkili olduğu bölümlere erişir." },
  { ikon: BarChart2,     baslik: "Raporlar",             aciklama: "Üretim, fire, verimlilik ve maliyet raporları. Excel'e aktarma." },
  { ikon: MessageSquare, baslik: "İç Mesajlaşma",        aciklama: "Kullanıcılar arası mesajlaşma, okunmamış bildirim rozeti." },
  { ikon: ShieldCheck,   baslik: "Bulut Tabanlı",        aciklama: "Veriler güvenli bulutta saklanır. Her cihazdan erişim, yedekleme otomatik." },
];

const ADIMLAR = [
  { no: "01", baslik: "Demo Talep Et",       aciklama: "Formu doldur, 24 saat içinde seni arayalım." },
  { no: "02", baslik: "Sistemi Dene",        aciklama: "30 günlük ücretsiz deneme, kurulum gerektirmez." },
  { no: "03", baslik: "Üretime Geç",         aciklama: "Verilerini yükle, ekibini tanımla, kullanmaya başla." },
];

export default function LandingPage() {
  const [oturum, setOturum] = useState(false);
  const [form, setForm] = useState({ ad: "", firma: "", tel: "", email: "" });
  const [gonderildi, setGonderildi] = useState(false);

  useEffect(() => {
    setOturum(!!localStorage.getItem("uretim_oturum"));
  }, []);

  function handleForm(e: React.FormEvent) {
    e.preventDefault();
    // Demo talebi mailto ile gönder
    const konu = encodeURIComponent("NexPlan Demo Talebi");
    const govde = encodeURIComponent(
      `Ad Soyad: ${form.ad}\nFirma: ${form.firma}\nTelefon: ${form.tel}\nE-posta: ${form.email}`
    );
    window.open(`mailto:salihtombuloglu771@gmail.com?subject=${konu}&body=${govde}`);
    setGonderildi(true);
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-slate-800 text-lg">NexPlan</span>
            <span className="text-slate-400 text-sm hidden sm:inline">ERP</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#ozellikler" className="text-slate-600 hover:text-blue-600 text-sm font-medium hidden md:inline transition-colors">Özellikler</a>
            <a href="#nasil-calisir" className="text-slate-600 hover:text-blue-600 text-sm font-medium hidden md:inline transition-colors">Nasıl Çalışır</a>
            <a href="#demo" className="text-slate-600 hover:text-blue-600 text-sm font-medium hidden md:inline transition-colors">Demo</a>
            {oturum ? (
              <Link href="/anasayfa" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                Sisteme Git <ArrowRight size={14} />
              </Link>
            ) : (
              <Link href="/giris" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-8">
            <Star size={14} className="fill-blue-400 text-blue-400" />
            Türkiye'nin Modern Üretim ERP'si
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Üretiminizi<br />
            <span className="text-blue-400">Dijitalleştirin</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            İş emirleri, makina takibi, kalite kontrol ve stok yönetimini tek platformda toplayın.
            Kurulum gerektirmez, tarayıcıdan çalışır.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#demo" className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base">
              Ücretsiz Demo İste <ArrowRight size={18} />
            </a>
            <Link href="/giris" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base">
              Giriş Yap
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-6">30 gün ücretsiz · Kredi kartı gerekmez · Kurulum yok</p>
        </div>
      </section>

      {/* ── RAKAMLAR ── */}
      <section className="bg-blue-600 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { sayi: "12+", etiket: "Modül" },
            { sayi: "100%", etiket: "Bulut Tabanlı" },
            { sayi: "7/24", etiket: "Erişim" },
            { sayi: "0₺", etiket: "Kurulum Ücreti" },
          ].map(({ sayi, etiket }) => (
            <div key={etiket}>
              <p className="text-3xl md:text-4xl font-bold">{sayi}</p>
              <p className="text-blue-200 text-sm mt-1">{etiket}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section id="ozellikler" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Her Şey Tek Platformda</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Fabrikadan depoya, kaliteden raporlamaya — üretim sürecinizin tamamını yönetin.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OZELLIKLER.map(({ ikon: Ikon, baslik, aciklama }) => (
              <div key={baslik} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Ikon size={22} className="text-blue-600" />
                </div>
                <h3 className="text-slate-800 font-semibold text-base mb-2">{baslik}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section id="nasil-calisir" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">3 Adımda Başlayın</h2>
            <p className="text-slate-500 text-lg">Karmaşık kurulum yok. Bugün talep edin, yarın kullanmaya başlayın.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ADIMLAR.map(({ no, baslik, aciklama }) => (
              <div key={no} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5">{no}</div>
                <h3 className="text-slate-800 font-semibold text-lg mb-2">{baslik}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEDEN NEXPLAN ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Neden NexPlan?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Kurulum gerektirmez, tarayıcıdan çalışır",
              "Mobil uyumlu, tabletten de erişilir",
              "Türkçe arayüz, yerel destek",
              "Verileriniz güvenli bulutta saklanır",
              "Excel import/export desteği",
              "Kullanıcı yetkilendirme sistemi",
              "Gerçek zamanlı operasyon takibi",
              "7/24 kesintisiz erişim",
            ].map((madde) => (
              <div key={madde} className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-slate-100">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 text-sm font-medium">{madde}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO FORMU ── */}
      <section id="demo" className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ücretsiz Demo İsteyin</h2>
            <p className="text-blue-200 text-lg">Formu doldurun, 24 saat içinde size ulaşalım.</p>
          </div>

          {gonderildi ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-xl">
              <CheckCircle size={52} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-slate-800 font-bold text-xl mb-2">Talebiniz Alındı!</h3>
              <p className="text-slate-500">En kısa sürede sizinle iletişime geçeceğiz.</p>
            </div>
          ) : (
            <form onSubmit={handleForm} className="bg-white rounded-2xl p-8 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Ad Soyad</label>
                  <input required value={form.ad} onChange={e => setForm(p => ({ ...p, ad: e.target.value }))}
                    placeholder="Ahmet Yılmaz"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Firma Adı</label>
                  <input required value={form.firma} onChange={e => setForm(p => ({ ...p, firma: e.target.value }))}
                    placeholder="ABC Üretim A.Ş."
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">Telefon</label>
                  <input required value={form.tel} onChange={e => setForm(p => ({ ...p, tel: e.target.value }))}
                    placeholder="0555 123 45 67" type="tel"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">E-posta</label>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="ahmet@firma.com" type="email"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
              <button type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base mt-2">
                Demo Talep Et <ArrowRight size={18} />
              </button>
              <p className="text-slate-400 text-xs text-center">Bilgileriniz üçüncü şahıslarla paylaşılmaz.</p>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-white text-lg">NexPlan ERP</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="mailto:salihtombuloglu771@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail size={14} /> salihtombuloglu771@gmail.com
              </a>
              <a href="tel:+905131234567" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={14} /> İletişim
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 NexPlan ERP. Tüm hakları saklıdır.</p>
            <Link href="/giris" className="text-blue-400 hover:text-blue-300 transition-colors">
              Müşteri Girişi →
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
