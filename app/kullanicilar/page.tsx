"use client";


import { apiAddKullanici, apiDeleteKullanici, apiGetKullanicilar } from "@/lib/api";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard, { getRol } from "@/components/AuthGuard";
import { Shield, PlusCircle, Trash2, Eye, EyeOff } from "lucide-react";

import type { Kullanici, KullaniciRol } from "@/data/types";

interface FormState {
  kullaniciAdi: string;
  sifre: string;
  rol: KullaniciRol;
}

const BOSLUK: FormState = { kullaniciAdi: "", sifre: "", rol: "operatör" };

export default function KullanicilarPage() {
  const [liste,       setListe]       = useState<Kullanici[]>([]);
  const [form,        setForm]        = useState<FormState>(BOSLUK);
  const [hata,        setHata]        = useState("");
  const [basari,      setBasari]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [mevcutKul,   setMevcutKul]   = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);

  useEffect(() => {
    const rol = getRol();
    setIsAdmin(rol === "admin");
    const kulAdi = localStorage.getItem("uretim_kullanici_adi") ?? "";
    setMevcutKul(kulAdi);
    apiGetKullanicilar().then((data) => { setListe(data); setLoading(false); });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.kullaniciAdi.trim() || !form.sifre.trim()) {
      setHata("Kullanıcı adı ve şifre zorunludur."); return;
    }
    if (liste.some((k) => k.kullaniciAdi.toLowerCase() === form.kullaniciAdi.trim().toLowerCase())) {
      setHata("Bu kullanıcı adı zaten kayıtlı."); return;
    }
    if (form.sifre.length < 4) {
      setHata("Şifre en az 4 karakter olmalıdır."); return;
    }
    setHata("");
    try {
      const { id } = await apiAddKullanici({ kullaniciAdi: form.kullaniciAdi.trim(), sifre: form.sifre, rol: form.rol });
      setListe((p) => [...p, { id, kullaniciAdi: form.kullaniciAdi.trim(), rol: form.rol }]);
      setForm(BOSLUK);
      setBasari(`"${form.kullaniciAdi.trim()}" kullanıcısı eklendi.`);
      setTimeout(() => setBasari(""), 4000);
    } catch {
      setHata(
        "Kayıt başarısız! Bu kullanıcı adı zaten mevcut olabilir."
      );
    }
  }

  async function handleSil(kullanici: Kullanici) {
    if (kullanici.kullaniciAdi === mevcutKul) return; // kendini silemesin
    await apiDeleteKullanici(kullanici.id);
    setListe((p) => p.filter((k) => k.id !== kullanici.id));
  }

  if (!isAdmin) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-slate-100">
          <Sidebar />
          <main className="flex-1 ml-60 p-6 flex items-center justify-center">
            <div className="text-center">
              <Shield size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Bu sayfaya erişim yetkiniz yok.</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Kullanıcı Yönetimi</h1>
            <p className="text-slate-500 text-sm mt-0.5">Sisteme giriş yapabilecek kullanıcıları yönet</p>
          </div>
          <div className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Toplam Kullanıcı</p>
            <p className="text-blue-600 text-3xl font-bold mt-1">{liste.length}</p>
          </div>
          <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Admin Sayısı</p>
            <p className="text-violet-600 text-3xl font-bold mt-1">
              {liste.filter((k) => k.rol === "admin").length}
            </p>
          </div>
        </div>

        {/* Bildirimler */}
        {basari && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-emerald-700 text-sm font-medium">
            {basari}
          </div>
        )}

        {/* Yeni kullanıcı formu */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-slate-800 font-semibold text-base mb-5 flex items-center gap-2">
            <PlusCircle size={18} className="text-blue-500" /> Yeni Kullanıcı Ekle
          </h2>
          <form onSubmit={handleEkle} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Kullanıcı Adı</label>
                <input name="kullaniciAdi" value={form.kullaniciAdi} onChange={handleChange}
                  placeholder="ör. ahmet" autoComplete="off"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Şifre</label>
                <div className="relative">
                  <input name="sifre" value={form.sifre} onChange={handleChange}
                    type={sifreGoster ? "text" : "password"}
                    placeholder="En az 4 karakter" autoComplete="new-password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                  <button type="button" onClick={() => setSifreGoster(!sifreGoster)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {sifreGoster ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Rol</label>
                <select name="rol" value={form.rol} onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                  <option value="operatör">Operatör — Kayıt ekleyebilir</option>
                  <option value="admin">Admin — Tam yetki</option>
                </select>
              </div>
            </div>

            {hata && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>}

            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                <PlusCircle size={16} /> Kullanıcı Ekle
              </button>
            </div>
          </form>
        </div>

        {/* Kullanıcı listesi */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm shadow-sm">Yükleniyor…</div>
        ) : liste.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3 shadow-sm">
            <Shield size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">Henüz kullanıcı kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-semibold text-base flex items-center gap-2">
                <Shield size={18} className="text-blue-500" /> Kullanıcılar
              </h2>
              <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-full">{liste.length} kullanıcı</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Kullanıcı Adı", "Rol", "Şifre", ""].map((b) => (
                      <th key={b} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium">{b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liste.map((k, i) => (
                    <tr key={k.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                      <td className="px-5 py-3.5 text-slate-800 font-medium">
                        {k.kullaniciAdi}
                        {k.kullaniciAdi === mevcutKul && (
                          <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Sen</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          k.rol === "admin"
                            ? "text-violet-600 bg-violet-100"
                            : "text-emerald-600 bg-emerald-100"
                        }`}>
                          {k.rol === "admin" ? "Admin" : "Operatör"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">••••••</td>
                      <td className="px-5 py-3.5">
                        {k.kullaniciAdi !== mevcutKul && (
                          <button onClick={() => handleSil(k)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Kullanıcıyı sil">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-amber-700 text-xs font-medium mb-1">⚠ Önemli</p>
          <p className="text-amber-600 text-xs">
            Bu sayfanın çalışması için Supabase&apos;de <code className="bg-amber-100 px-1 rounded">kullanicilar</code> tablosunun
            oluşturulmuş olması gerekir. Tablo yoksa giriş hardcoded hesaplarla (admin/1234) çalışmaya devam eder.
          </p>
        </div>

      </main>
    </div>
    </AuthGuard>
  );
}
