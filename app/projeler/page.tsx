"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import {
  apiGetProjeler, apiAddProje, apiUpdateProjeDurum, apiDeleteProje,
  apiGetGorevler, apiAddGorev, apiUpdateGorevDurum, apiDeleteGorev,
} from "@/lib/api";
import type { Proje, ProjeGorev, ProjeDurum, GorevDurum } from "@/data/types";
import { FolderKanban, PlusCircle, Trash2, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, X, Plus } from "lucide-react";

const PROJE_DURUM_RENGI: Record<ProjeDurum, string> = {
  planlama:    "text-slate-500  bg-slate-100",
  aktif:       "text-blue-600   bg-blue-100",
  tamamlandi:  "text-emerald-600 bg-emerald-100",
  iptal:       "text-red-500    bg-red-100",
};
const PROJE_DURUM_ETIKETI: Record<ProjeDurum, string> = {
  planlama: "Planlama", aktif: "Aktif", tamamlandi: "Tamamlandı", iptal: "İptal",
};
const GOREV_DURUM_ICON: Record<GorevDurum, React.ReactNode> = {
  bekliyor:     <Circle     size={14} className="text-slate-400" />,
  devam_ediyor: <Clock      size={14} className="text-blue-500"  />,
  tamamlandi:   <CheckCircle2 size={14} className="text-emerald-500" />,
};

interface ProjeGorevExt extends ProjeGorev { loading?: boolean; }
interface ProjeExt extends Proje { gorevler?: ProjeGorevExt[]; gorevYuklendi?: boolean; }

interface FormState {
  projeKodu: string; projeAdi: string; musteri: string;
  baslangicTarihi: string; bitisTarihi: string;
  sorumlu: string; durum: ProjeDurum; aciklama: string; butce: string;
}
const BOSLUK: FormState = {
  projeKodu: "", projeAdi: "", musteri: "", baslangicTarihi: "",
  bitisTarihi: "", sorumlu: "", durum: "planlama", aciklama: "", butce: "",
};

export default function ProjelerPage() {
  const [liste,    setListe]    = useState<ProjeExt[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [formAcik, setFormAcik] = useState(false);
  const [acikId,   setAcikId]   = useState<string | null>(null);
  const [hata,     setHata]     = useState("");
  const [form,     setForm]     = useState<FormState>(BOSLUK);
  const [yeniGorev, setYeniGorev] = useState<Record<string,string>>({});

  useEffect(() => {
    apiGetProjeler().then(d => { setListe(d as ProjeExt[]); setLoading(false); });
  }, []);

  async function handleAc(id: string) {
    if (acikId === id) { setAcikId(null); return; }
    setAcikId(id);
    const proje = liste.find(p => p.id === id);
    if (!proje?.gorevYuklendi) {
      const gorevler = await apiGetGorevler(id) as ProjeGorevExt[];
      setListe(p => p.map(x => x.id === id ? { ...x, gorevler, gorevYuklendi: true } : x));
    }
  }

  async function handleProjeEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.projeKodu.trim() || !form.projeAdi.trim()) { setHata("Proje kodu ve adı zorunludur."); return; }
    setHata("");
    const { id } = await apiAddProje({
      projeKodu: form.projeKodu.trim(), projeAdi: form.projeAdi.trim(),
      musteri: form.musteri || undefined, baslangicTarihi: form.baslangicTarihi || undefined,
      bitisTarihi: form.bitisTarihi || undefined, sorumlu: form.sorumlu || undefined,
      durum: form.durum, aciklama: form.aciklama || undefined,
      butce: form.butce ? parseFloat(form.butce) : undefined,
    }) as { id: string };
    const yeniProje: ProjeExt = { ...form, id, butce: form.butce ? parseFloat(form.butce) : undefined, gorevler: [], gorevYuklendi: true };
    setListe(p => [yeniProje, ...p]);
    setForm(BOSLUK); setFormAcik(false);
  }

  async function handleProjeSil(id: string) {
    await apiDeleteProje(id);
    setListe(p => p.filter(x => x.id !== id));
    if (acikId === id) setAcikId(null);
  }

  async function handleProjeDurum(proje: ProjeExt, durum: ProjeDurum) {
    await apiUpdateProjeDurum(proje.id, durum);
    setListe(p => p.map(x => x.id === proje.id ? { ...x, durum } : x));
  }

  async function handleGorevEkle(projeId: string) {
    const adi = (yeniGorev[projeId] ?? "").trim();
    if (!adi) return;
    const { id } = await apiAddGorev(projeId, { gorevAdi: adi, durum: "bekliyor" }) as { id: string };
    const yeni: ProjeGorevExt = { id, projeId, gorevAdi: adi, durum: "bekliyor" };
    setListe(p => p.map(x => x.id === projeId ? { ...x, gorevler: [...(x.gorevler ?? []), yeni] } : x));
    setYeniGorev(p => ({ ...p, [projeId]: "" }));
  }

  async function handleGorevDurum(projeId: string, gorev: ProjeGorevExt) {
    const sirali: GorevDurum[] = ["bekliyor", "devam_ediyor", "tamamlandi"];
    const yeniDurum = sirali[(sirali.indexOf(gorev.durum) + 1) % 3];
    await apiUpdateGorevDurum(gorev.id, yeniDurum);
    setListe(p => p.map(x => x.id === projeId
      ? { ...x, gorevler: x.gorevler?.map(g => g.id === gorev.id ? { ...g, durum: yeniDurum } : g) }
      : x));
  }

  async function handleGorevSil(projeId: string, gorevId: string) {
    await apiDeleteGorev(gorevId);
    setListe(p => p.map(x => x.id === projeId
      ? { ...x, gorevler: x.gorevler?.filter(g => g.id !== gorevId) }
      : x));
  }

  const istatistik = {
    toplam:    liste.length,
    aktif:     liste.filter(p => p.durum === "aktif").length,
    tamam:     liste.filter(p => p.durum === "tamamlandi").length,
    planlama:  liste.filter(p => p.durum === "planlama").length,
  };

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 md:ml-60 p-6 space-y-6">

        {/* Başlık */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold">Proje Yönetim</h1>
            <p className="text-slate-500 text-sm mt-0.5">Projeleri ve görevleri yönet</p>
          </div>
          <button onClick={() => setFormAcik(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
            <PlusCircle size={16}/> Yeni Proje
          </button>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Toplam",     value: istatistik.toplam,   renk: "text-blue-600"    },
            { label: "Aktif",      value: istatistik.aktif,    renk: "text-blue-600"    },
            { label: "Planlama",   value: istatistik.planlama, renk: "text-slate-600"   },
            { label: "Tamamlandı", value: istatistik.tamam,    renk: "text-emerald-600" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs uppercase tracking-wide">{c.label}</p>
              <p className={`${c.renk} text-2xl font-bold mt-1`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Yeni proje formu */}
        {formAcik && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <FolderKanban size={18} className="text-blue-500"/> Yeni Proje
              </h2>
              <button onClick={() => { setFormAcik(false); setHata(""); }} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <form onSubmit={handleProjeEkle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Proje Kodu *", name: "projeKodu", placeholder: "ör. PRJ-001"        },
                  { label: "Proje Adı *",  name: "projeAdi",  placeholder: "ör. Fabrika Otomasyon" },
                  { label: "Müşteri",      name: "musteri",   placeholder: "ör. ABC A.Ş."        },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">{f.label}</label>
                    <input name={f.name} value={(form as unknown as Record<string,string>)[f.name]}
                      onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Başlangıç</label>
                  <input type="date" name="baslangicTarihi" value={form.baslangicTarihi}
                    onChange={e => setForm(p => ({ ...p, baslangicTarihi: e.target.value }))}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Bitiş</label>
                  <input type="date" name="bitisTarihi" value={form.bitisTarihi}
                    onChange={e => setForm(p => ({ ...p, bitisTarihi: e.target.value }))}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Sorumlu</label>
                  <input name="sorumlu" value={form.sorumlu}
                    onChange={e => setForm(p => ({ ...p, sorumlu: e.target.value }))}
                    placeholder="ör. Ahmet Yılmaz"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Bütçe ₺</label>
                  <input name="butce" value={form.butce} type="number" min="0" step="100"
                    onChange={e => setForm(p => ({ ...p, butce: e.target.value }))}
                    placeholder="0"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Açıklama</label>
                <textarea name="aciklama" value={form.aciklama} rows={2}
                  onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))}
                  placeholder="Proje hakkında kısa açıklama…"
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"/>
              </div>
              {hata && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>}
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <PlusCircle size={16}/> Proje Oluştur
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Proje listesi */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">Yükleniyor…</div>
        ) : liste.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center gap-3">
            <FolderKanban size={40} className="text-slate-200"/>
            <p className="text-slate-500 text-sm">Henüz proje yok. Yeni Proje butonuna tıklayın.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {liste.map(proje => {
              const tamam  = proje.gorevler?.filter(g=>g.durum==="tamamlandi").length ?? 0;
              const toplam = proje.gorevler?.length ?? 0;
              const pct    = toplam > 0 ? Math.round(tamam/toplam*100) : 0;

              return (
                <div key={proje.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Proje başlık satırı */}
                  <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={()=>handleAc(proje.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-blue-600 font-medium text-sm">{proje.projeKodu}</span>
                        <span className="text-slate-800 font-semibold">{proje.projeAdi}</span>
                        {proje.musteri && <span className="text-slate-400 text-xs">/ {proje.musteri}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                        {proje.sorumlu    && <span>Sorumlu: {proje.sorumlu}</span>}
                        {proje.bitisTarihi && <span>Bitiş: {new Date(proje.bitisTarihi).toLocaleDateString("tr-TR")}</span>}
                        {proje.butce      && <span>Bütçe: {proje.butce.toLocaleString("tr-TR")} ₺</span>}
                        {toplam > 0 && <span className="text-slate-400">{tamam}/{toplam} görev tamamlandı</span>}
                      </div>
                      {toplam > 0 && (
                        <div className="mt-2 h-1.5 w-full max-w-xs bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${pct}%`}}/>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select value={proje.durum} onClick={e=>e.stopPropagation()}
                        onChange={e=>{e.stopPropagation(); handleProjeDurum(proje, e.target.value as ProjeDurum);}}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none ${PROJE_DURUM_RENGI[proje.durum]}`}>
                        {Object.entries(PROJE_DURUM_ETIKETI).map(([v,l])=>(
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                      <button onClick={e=>{e.stopPropagation();handleProjeSil(proje.id);}}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                      {acikId===proje.id ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                    </div>
                  </div>

                  {/* Görevler paneli */}
                  {acikId===proje.id && (
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-3">Görevler</p>
                      <div className="space-y-1.5">
                        {(proje.gorevler ?? []).length === 0 && (
                          <p className="text-slate-400 text-sm">Henüz görev eklenmedi.</p>
                        )}
                        {(proje.gorevler ?? []).map(g => (
                          <div key={g.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100 group">
                            <button onClick={()=>handleGorevDurum(proje.id,g)} title="Durumu değiştir" className="flex-shrink-0">
                              {GOREV_DURUM_ICON[g.durum]}
                            </button>
                            <span className={`flex-1 text-sm ${g.durum==="tamamlandi"?"line-through text-slate-400":"text-slate-700"}`}>
                              {g.gorevAdi}
                            </span>
                            {g.atanan && <span className="text-slate-400 text-xs">{g.atanan}</span>}
                            {g.bitisTarihi && <span className="text-slate-400 text-xs">{new Date(g.bitisTarihi).toLocaleDateString("tr-TR")}</span>}
                            <button onClick={()=>handleGorevSil(proje.id,g.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-400 transition-all">
                              <X size={12}/>
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Yeni görev ekle */}
                      <div className="flex items-center gap-2 mt-3">
                        <input
                          value={yeniGorev[proje.id] ?? ""}
                          onChange={e=>setYeniGorev(p=>({...p,[proje.id]:e.target.value}))}
                          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();handleGorevEkle(proje.id);}}}
                          placeholder="Görev adı yazıp Enter'a basın…"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"/>
                        <button onClick={()=>handleGorevEkle(proje.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">
                          <Plus size={13}/> Ekle
                        </button>
                      </div>
                      {proje.aciklama && (
                        <p className="mt-3 text-slate-500 text-xs border-t border-slate-100 pt-3">{proje.aciklama}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
    </AuthGuard>
  );
}
