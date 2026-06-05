"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClipboardList, Wrench, ShieldCheck, Layers,
  BarChart2, ArrowRight, CheckCircle2,
  Package, Play, Mail, Linkedin,
  ChevronRight, TrendingDown, Clock, AlertTriangle,
  Zap, Lock, Globe, BadgeCheck, Users,
} from "lucide-react";

export default function LandingPage() {
  const [oturum,    setOturum]    = useState(false);
  const [form,      setForm]      = useState({ ad: "", firma: "", tel: "", email: "" });
  const [gonderildi,setGonderildi]= useState(false);
  const [aktifSoru, setAktifSoru] = useState<number | null>(null);
  const [scrolled,  setScrolled]  = useState(false);

  useEffect(() => {
    setOturum(!!localStorage.getItem("uretim_oturum"));

    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal, .reveal-scale, .reveal-left, .reveal-right").forEach(el => obs.observe(el));

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { obs.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  function handleSpotlight(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);
  }

  function handleForm(e: React.FormEvent) {
    e.preventDefault();
    const konu = encodeURIComponent("NexPlan Demo Talebi");
    const govde = encodeURIComponent(
      `Ad Soyad: ${form.ad}\nFirma: ${form.firma}\nTelefon: ${form.tel}\nE-posta: ${form.email}`
    );
    window.open(`mailto:salihtombuloglu771@gmail.com?subject=${konu}&body=${govde}`);
    setGonderildi(true);
  }

  const SORUNLAR = [
    { ikon: ClipboardList, metin: "İş emirleri hâlâ kağıt veya Excel'de takip ediliyor" },
    { ikon: AlertTriangle,  metin: "Fire miktarları elle hesaplanıyor, geç fark ediliyor" },
    { ikon: Clock,          metin: "Hangi makina ne zaman arıza yaptı, kimse bilmiyor" },
    { ikon: TrendingDown,   metin: "Operatör verimliliğini ölçecek bir sistem yok" },
    { ikon: Package,        metin: "Stok tükendiğinde üretim duruyor, haber geç geliyor" },
  ];

  const OZELLIKLER = [
    {
      ikon: ClipboardList,
      baslik: "İş Emri & Operasyon",
      renk: "bg-blue-500",
      list: [
        "Üretim emri oluştur, makina ve operatöre ata",
        "Başlat / Durdur tuşuyla gerçek zamanlı süre takibi",
        "Hedef vs. gerçekleşen üretim karşılaştırması",
        "Vardiya bazlı raporlama (1. ve 2. vardiya)",
      ],
    },
    {
      ikon: ShieldCheck,
      baslik: "Kalite Kontrol",
      renk: "bg-emerald-500",
      list: [
        "Her iş emrini kalite kontrolden geçir",
        "Uygun / uygunsuz adet kayıt et, fotoğraf ekle",
        "Fire oranı otomatik hesaplanır, eşik aşılınca uyarı",
        "Kalite geçme oranı trendi günlük izlenir",
      ],
    },
    {
      ikon: Wrench,
      baslik: "Makina & Bakım",
      renk: "bg-amber-500",
      list: [
        "Makina parkı listesi, aktif/pasif durum",
        "Bakım tarihi ve periyot takibi, kalan gün sayacı",
        "Duruş kaydı: arıza, bakım, malzeme, kalıp ayrımı",
        "Makina bazlı fire ve verimlilik analizi",
      ],
    },
    {
      ikon: Layers,
      baslik: "Stok & Malzeme",
      renk: "bg-violet-500",
      list: [
        "Malzeme kartı: foto, kod, birim, birim fiyat",
        "Kritik stok uyarısı (≤10 birim otomatik işaretlenir)",
        "Sevkiyat ve üretim deposu ayrı yönetim",
        "Excel ile toplu import/export desteği",
      ],
    },
    {
      ikon: BarChart2,
      baslik: "Raporlar & Analiz",
      renk: "bg-rose-500",
      list: [
        "Son 7–30 gün üretim trendi grafiği",
        "Vardiya, ürün ve makina bazlı fire analizi",
        "Kalite kontrol 7 günlük geçme/kalma trendi",
        "Duruş sebebi dağılımı, toplam duruş süresi",
      ],
    },
    {
      ikon: Package,
      baslik: "Finans & Projeler",
      renk: "bg-teal-500",
      list: [
        "Fatura ve irsaliye oluştur, KDV hesabı otomatik",
        "Proje ve görev takibi, bitiş tarihi uyarısı",
        "Sabit kıymet ve demirbaş listesi",
        "Net üretim değeri, ciro hesaplama",
      ],
    },
  ];

  const REFERANSLAR = [
    {
      metin: "Üç ay önce hâlâ Excel'de takip ediyorduk. Şimdi operatörler telefondan başlat/durdur yapıyor, ben sabah raporları görüyorum.",
      isim: "Murat B.",
      unvan: "Üretim Müdürü",
      sektor: "Metal İşleme",
      renk: "from-blue-500 to-indigo-600",
      sure: "6 aydır kullanıyor",
    },
    {
      metin: "Fire oranımız %8'den %3.2'ye indi. Hangi makinada, hangi üründe fire çıktığını artık anlık görüyoruz.",
      isim: "Selin K.",
      unvan: "Kalite Sorumlusu",
      sektor: "Plastik Enjeksiyon",
      renk: "from-emerald-500 to-teal-600",
      sure: "1 yıldır kullanıyor",
    },
    {
      metin: "Kurulum için IT ekibine gerek duyduk ama 1 günde hallettiler. Sistemi açtık, verilerimizi girdik, hemen kullanmaya başladık.",
      isim: "Tayfun Ö.",
      unvan: "İşletme Sahibi",
      sektor: "Tekstil Üretimi",
      renk: "from-violet-500 to-purple-600",
      sure: "8 aydır kullanıyor",
    },
  ];

  const SSS = [
    {
      soru: "Mevcut Excel dosyalarımızı taşıyabilir miyiz?",
      cevap: "Evet. Malzeme listesi, ürün kataloğu ve personel kayıtları Excel (.xlsx) formatında toplu olarak sisteme aktarılabilir. Taşıma sürecinde destek sağlıyoruz.",
    },
    {
      soru: "İnternet olmadığında sistem çalışır mı?",
      cevap: "NexPlan bulut tabanlıdır; aktif internet bağlantısı gerektirir. Ancak stabil bağlantıyla mobil ağ üzerinden de sorunsuz çalışır.",
    },
    {
      soru: "Kaç kullanıcı aynı anda sisteme girebilir?",
      cevap: "Paketinize göre değişir. Pro pakette 20 eş zamanlı kullanıcı desteklenir. Kurumsal pakette kullanıcı sayısı sınırsızdır.",
    },
    {
      soru: "Verilerimiz güvende mi?",
      cevap: "Veriler Supabase altyapısıyla Avrupa veri merkezlerinde şifreli olarak saklanır. Günlük otomatik yedekleme yapılır, erişim JWT token ile korunur.",
    },
    {
      soru: "Deneme süresi bittikten sonra verilerimize ne olur?",
      cevap: "30 günlük deneme bitişinde verileriniz 30 gün daha sistemde tutulur. Bu sürede export edebilir veya pakete geçerek devam edebilirsiniz.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 transition-shadow duration-300 ${scrolled ? "shadow-md shadow-slate-200/60" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm tracking-tight">N</span>
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">NexPlan</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#ozellikler" className="text-slate-500 hover:text-blue-600 text-sm hidden md:inline transition-colors">Özellikler</a>
            <a href="#referanslar" className="text-slate-500 hover:text-blue-600 text-sm hidden md:inline transition-colors">Referanslar</a>
            <a href="#fiyat" className="text-slate-500 hover:text-blue-600 text-sm hidden md:inline transition-colors">Fiyat</a>
            <a href="#sss" className="text-slate-500 hover:text-blue-600 text-sm hidden md:inline transition-colors">SSS</a>
            {oturum ? (
              <Link href="/anasayfa"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                Sisteme Gir <ChevronRight size={14}/>
              </Link>
            ) : (
              <Link href="/giris"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg, #0c1445 0%, #1a237e 40%, #0d47a1 100%)" }}
        className="text-white py-20 md:py-28 px-6 relative overflow-hidden">
        {/* Aurora orbs */}
        <div className="aurora-orb w-[480px] h-[480px] bg-blue-400 opacity-[0.13]"
          style={{ top: "-15%", right: "-8%", animationDuration: "11s" }}/>
        <div className="aurora-orb w-[360px] h-[360px] bg-indigo-500 opacity-[0.12]"
          style={{ bottom: "-10%", left: "-6%", animationDuration: "9s", animationDelay: "3s" }}/>
        <div className="aurora-orb w-[260px] h-[260px] bg-cyan-400 opacity-[0.10]"
          style={{ top: "35%", right: "18%", animationDuration: "13s", animationDelay: "6s" }}/>
        {/* Arka plan nokta deseni */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}/>
        <div className="relative max-w-5xl mx-auto">
          <div className="animate-fade-in-up badge-shine inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-blue-200 text-sm font-medium mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            Türk üretim firmalarına özel ERP
          </div>
          <h1 className="animate-fade-in-up text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight"
            style={{ animationDelay: "80ms" }}>
            Fabrikanızı kağıtsız<br/>
            <span className="text-gradient-animate">yönetin.</span>
          </h1>
          <p className="animate-fade-in-up text-blue-100/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
            style={{ animationDelay: "160ms" }}>
            İş emirleri, makina takibi, kalite kontrol ve stok — hepsi tek sistemde.
            Kurulum yok, IT desteği gerekir, bugün başlayabilirsiniz.
          </p>
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-3" style={{ animationDelay: "240ms" }}>
            <a href="#demo"
              className="animate-cta-glow inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-lg">
              Ücretsiz Demo İsteyin <ArrowRight size={16}/>
            </a>
            <Link href="/giris"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors">
              Sisteme Gir
            </Link>
          </div>
          <p className="animate-fade-in-up text-blue-300/60 text-xs mt-5" style={{ animationDelay: "320ms" }}>
            30 gün ücretsiz · Kredi kartı gerekmez · Verileriniz Türkiye/AB sunucularında
          </p>
          <div className="animate-fade-in-up flex flex-wrap gap-8 mt-8 pt-8 border-t border-white/10" style={{ animationDelay: "400ms" }}>
            {[
              { deger: "150+",  etiket: "Aktif firma" },
              { deger: "%98",   etiket: "Memnuniyet oranı" },
              { deger: "7/24",  etiket: "Destek hattı" },
              { deger: "1 gün", etiket: "Ortalama kurulum" },
            ].map(s => (
              <div key={s.etiket}>
                <div className="text-white font-black text-2xl leading-none">{s.deger}</div>
                <div className="text-blue-300/70 text-xs mt-1">{s.etiket}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FİRMA LOGOSU ŞERİDİ ── */}
      <section className="py-7 px-6 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-slate-400 text-xs font-medium uppercase tracking-widest mb-5">
            Türkiye genelinde üretim firmalarının güvendiği sistem
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {["Yılmaz Metal San.", "Özdemir Plastik", "Karataş Tekstil", "Doğan Makine", "Şahin Otomotiv", "Akar Ambalaj"].map(firma => (
              <span key={firma} className="text-slate-400 font-bold text-sm tracking-tight opacity-50 hover:opacity-80 transition-opacity">
                {firma}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TANIDIK MI? ── */}
      <section className="py-16 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="reveal text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800">Bunları yaşıyor musunuz?</h2>
            <p className="text-slate-500 text-sm mt-2">NexPlan tam olarak bu sorunlar için geliştirildi.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SORUNLAR.map(({ ikon: Ikon, metin }, i) => (
              <div key={i} className="reveal flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ikon size={15} className="text-red-500"/>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{metin}</p>
              </div>
            ))}
            <div className="reveal flex items-start gap-3 bg-blue-600 rounded-xl p-4 shadow-sm"
              style={{ transitionDelay: `${SORUNLAR.length * 60}ms` }}>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={15} className="text-white"/>
              </div>
              <p className="text-white text-sm font-medium leading-relaxed">NexPlan ile bunların hepsi geçmişte kalır.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section id="ozellikler" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Neler yapabilirsiniz</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Üretimden finansa her şey tek yerde</h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              Ayrı ayrı yazılım almak yerine üretim sürecinizin tamamını kapsayan tek bir sistem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OZELLIKLER.map(({ ikon: Ikon, baslik, renk, list }, i) => (
              <div key={baslik}
                className="reveal card-hover card-spotlight rounded-2xl p-6 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                style={{ transitionDelay: `${(i % 3) * 70}ms` }}
                onMouseMove={handleSpotlight}>
                <div className={`w-10 h-10 ${renk} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  <Ikon size={18} className="text-white"/>
                </div>
                <h3 className="text-slate-800 font-bold text-base mb-3">{baslik}</h3>
                <ul className="space-y-2">
                  {list.map((madde, j) => (
                    <li key={j} className="flex items-start gap-2 text-slate-500 text-sm">
                      <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 flex-shrink-0"/>
                      {madde}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="reveal text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Başlangıç süreci</p>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Aynı gün aktif olun</h2>
            <p className="text-slate-500">Uzun kurulum süreçleri, danışmanlık ücretleri yok.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                no: "1",
                baslik: "Demo talep edin",
                aciklama: "Formu doldurun, 24 saat içinde sizi arayalım. Firmanızın ihtiyaçlarını birlikte konuşalım.",
                sure: "5 dakika",
              },
              {
                no: "2",
                baslik: "Sistemi kendiniz deneyin",
                aciklama: "30 günlük tam erişimli deneme. Makinalarınızı, ürünlerinizi ve personeli girin, sistemi gerçek verilerle test edin.",
                sure: "30 gün ücretsiz",
              },
              {
                no: "3",
                baslik: "Üretime alın",
                aciklama: "Ekibinizi ekleyin, rollerini belirleyin, eski verilerinizi Excel ile aktarın. Hazır.",
                sure: "1 iş günü",
              },
            ].map((adim, i) => (
              <div key={adim.no} className="reveal-scale text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="step-num w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-md shadow-blue-200 cursor-default">
                  {adim.no}
                </div>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-2">{adim.sure}</p>
                <h3 className="text-slate-800 font-bold text-base mb-2">{adim.baslik}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{adim.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REFERANSLAR ── */}
      <section id="referanslar" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="reveal text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Users size={13}/> 150+ aktif kullanıcı
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Üreticiler ne diyor?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REFERANSLAR.map((ref, i) => (
              <div key={i} className="reveal card-hover card-spotlight rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
                style={{ transitionDelay: `${i * 80}ms` }}
                onMouseMove={handleSpotlight}>
                {/* Üst: yıldız + doğrulandı rozeti */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <BadgeCheck size={11}/> Doğrulanmış
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">&quot;{ref.metin}&quot;</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ref.renk} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-white text-sm font-black">{ref.isim[0]}</span>
                    </div>
                    <div>
                      <p className="text-slate-800 text-sm font-semibold">{ref.isim}</p>
                      <p className="text-slate-400 text-xs">{ref.unvan} · {ref.sektor}</p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-xs hidden sm:block">{ref.sure}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GÜVEN BANDI ── */}
      <section className="py-10 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { ikon: Zap,   baslik: "Hızlı kurulum",   aciklama: "Aynı gün aktif olun" },
              { ikon: Lock,  baslik: "Güvenli altyapı", aciklama: "JWT + TLS şifreleme" },
              { ikon: Globe, baslik: "Her cihazdan",     aciklama: "Mobil, tablet, PC" },
              { ikon: Play,  baslik: "Gerçek zamanlı",   aciklama: "Anlık operasyon takibi" },
            ].map(({ ikon: Ikon, baslik, aciklama }) => (
              <div key={baslik} className="reveal flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                  <Ikon size={18} className="text-blue-600"/>
                </div>
                <p className="text-slate-800 text-sm font-semibold">{baslik}</p>
                <p className="text-slate-400 text-xs">{aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FİYATLANDIRMA ── */}
      <section id="fiyat" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="reveal text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Şeffaf fiyatlandırma</p>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Firma büyüklüğünüze göre seçin</h2>
            <p className="text-slate-500">Gizli ücret yok. İstediğiniz zaman paketi değiştirebilir veya iptal edebilirsiniz.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                ad: "Başlangıç",
                fiyat: "990",
                aciklama: "5'e kadar kullanıcı",
                ozellikler: ["İş emri ve operasyon takibi", "Kalite kontrol modülü", "Malzeme ve stok yönetimi", "Makina ve bakım takibi", "Temel raporlar", "E-posta destek"],
                populer: false,
                renk: "border-slate-200 bg-white",
                btnRenk: "bg-slate-800 hover:bg-slate-900 text-white",
                paket: "baslangic", fiyatNo: "990",
              },
              {
                ad: "Pro",
                fiyat: "2.490",
                aciklama: "20'ye kadar kullanıcı",
                ozellikler: ["Başlangıç'taki her şey", "Depo ve sevkiyat takibi", "Fatura ve irsaliye", "Proje yönetimi", "Gelişmiş raporlar + Excel", "Öncelikli destek"],
                populer: true,
                renk: "border-blue-500 bg-white shadow-xl shadow-blue-100/60",
                btnRenk: "bg-blue-600 hover:bg-blue-700 text-white",
                paket: "pro", fiyatNo: "2490",
              },
              {
                ad: "Kurumsal",
                fiyat: "4.990",
                aciklama: "Sınırsız kullanıcı",
                ozellikler: ["Pro'daki her şey", "Sınırsız kullanıcı ekleme", "Özel modül geliştirme", "API entegrasyon desteği", "Telefon + yerinde destek", "SLA garantisi"],
                populer: false,
                renk: "border-slate-200 bg-white",
                btnRenk: "bg-slate-800 hover:bg-slate-900 text-white",
                paket: "kurumsal", fiyatNo: "4990",
              },
            ].map((p, i) => (
              <div key={p.ad}
                className={`reveal-scale card-spotlight relative rounded-2xl border-2 p-7 flex flex-col ${p.renk}`}
                style={{ transitionDelay: `${i * 100}ms` }}
                onMouseMove={handleSpotlight}>
                {p.populer && (
                  <div className="badge-shine absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    En çok tercih edilen
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-slate-800 font-bold text-lg">{p.ad}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{p.aciklama}</p>
                  <div className="flex items-end gap-1 mt-3">
                    <span className="text-slate-800 text-3xl font-black">₺{p.fiyat}</span>
                    <span className="text-slate-400 text-sm mb-1">/ay</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {p.ozellikler.map(o => (
                    <li key={o} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0"/>
                      {o}
                    </li>
                  ))}
                </ul>
                <Link href={`/odeme?paket=${p.paket}&fiyat=${p.fiyatNo}`}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${p.btnRenk}`}>
                  Başla
                </Link>
              </div>
            ))}
          </div>
          <p className="reveal text-center text-slate-400 text-xs mt-8">
            KDV dahil · 30 günlük para iade garantisi · İstediğinizde iptal
          </p>
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className="py-20 px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <div className="reveal text-center mb-12">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Merak edilenler</p>
            <h2 className="text-3xl font-bold text-slate-800">Sık sorulan sorular</h2>
          </div>
          <div className="space-y-2">
            {SSS.map((item, i) => (
              <div key={i} className="reveal bg-white rounded-2xl border border-slate-200 overflow-hidden"
                style={{ transitionDelay: `${i * 50}ms` }}>
                <button
                  onClick={() => setAktifSoru(aktifSoru === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-slate-800 font-medium text-sm">{item.soru}</span>
                  <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ml-3 ${aktifSoru === i ? "rotate-90" : ""}`}/>
                </button>
                <div className={`sss-body ${aktifSoru === i ? "open" : ""}`}>
                  <div>
                    <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                      {item.cevap}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO FORMU ── */}
      <section id="demo" className="py-20 px-6" style={{ background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)" }}>
        <div className="max-w-xl mx-auto">
          <div className="reveal text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Ücretsiz demo isteyin</h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Firmanıza özel 30 dakikalık demo ayarlayalım. Sistemi kendi fabrika verilerinizle görün.
            </p>
          </div>

          {gonderildi ? (
            <div className="reveal bg-white rounded-2xl p-10 text-center shadow-2xl">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500"/>
              </div>
              <h3 className="text-slate-800 font-bold text-xl mb-2">Talebiniz alındı!</h3>
              <p className="text-slate-500 text-sm">En geç 24 saat içinde sizi arıyoruz.</p>
            </div>
          ) : (
            <div className="reveal bg-white rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleForm} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "ad",    label: "Adınız Soyadınız",  placeholder: "Ahmet Yılmaz" },
                    { key: "firma", label: "Firma Adı",          placeholder: "Yılmaz Metal A.Ş." },
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide">{f.label}</label>
                      <input required value={(form as Record<string, string>)[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "tel",   label: "Telefon",   placeholder: "0532 000 00 00", type: "tel"   },
                    { key: "email", label: "E-posta",   placeholder: "ahmet@firma.com", type: "email" },
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className="text-slate-600 text-xs font-semibold uppercase tracking-wide">{f.label}</label>
                      <input type={f.type} value={(form as Record<string, string>)[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"/>
                    </div>
                  ))}
                </div>
                <button type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm shadow-blue-300/50">
                  Demo Talep Et <ArrowRight size={16}/>
                </button>
                <p className="text-slate-400 text-xs text-center">Bilgileriniz üçüncü taraflarla paylaşılmaz.</p>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xs">N</span>
                </div>
                <span className="font-bold text-white text-base">NexPlan ERP</span>
              </div>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Türk üretim firmalarına özel bulut tabanlı üretim yönetim sistemi.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Ürün</p>
                <div className="space-y-2">
                  {["Özellikler","Fiyatlandırma","SSS","Demo"].map(l => (
                    <a key={l} href={`#${l.toLowerCase()}`} className="block text-slate-400 hover:text-white text-xs transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">İletişim</p>
                <div className="space-y-2">
                  <a href="mailto:salihtombuloglu771@gmail.com"
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors">
                    <Mail size={12}/> E-posta
                  </a>
                  <a href="https://linkedin.com/company/nexplan-erp" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors">
                    <Linkedin size={12}/> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 NexPlan ERP. Tüm hakları saklıdır.</p>
            <Link href="/giris" className="text-blue-400 hover:text-blue-300 transition-colors">
              Müşteri girişi →
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
