"use client";

import { useState, useEffect, useRef } from "react";
import { apiGetFaturalar, apiAddFatura, apiUpdateFaturaDurum, apiDeleteFatura } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import type { Fatura, FaturaKalem, FaturaTip, KdvOrani } from "@/data/types";
import { FileText, PlusCircle, Trash2, Printer, ChevronDown, ChevronUp, Plus, X } from "lucide-react";

const BOSLUK_KALEM: FaturaKalem = { urunAdi: "", miktar: 1, birim: "adet", birimFiyat: 0, kdvOrani: 20 };

interface FormState {
  tip: FaturaTip; tarih: string; musteriAdi: string; musteriAdres: string; notlar: string;
  kalemler: FaturaKalem[];
}

function hesapla(kalemler: FaturaKalem[]) {
  const araToplam   = kalemler.reduce((t, k) => t + k.miktar * k.birimFiyat, 0);
  const kdvToplam   = kalemler.reduce((t, k) => t + k.miktar * k.birimFiyat * k.kdvOrani / 100, 0);
  const genelToplam = araToplam + kdvToplam;
  return { araToplam, kdvToplam, genelToplam };
}

function faturaNoUret(liste: Fatura[], tip: FaturaTip) {
  const prefix = tip === "fatura" ? "FAT" : "IRS";
  const yil    = new Date().getFullYear();
  const sayac  = liste.filter(f => f.tip === tip && f.faturaNo.startsWith(`${prefix}-${yil}`)).length + 1;
  return `${prefix}-${yil}-${String(sayac).padStart(3, "0")}`;
}

const DURUM_RENGI = {
  taslak:  "text-slate-500 bg-slate-100",
  kesildi: "text-emerald-600 bg-emerald-100",
  iptal:   "text-red-500 bg-red-100",
};

export default function FaturaPage() {
  const { toast } = useToast();
  const [silId, setSilId] = useState<string | null>(null);
  const [liste,     setListe]     = useState<Fatura[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [formAcik,  setFormAcik]  = useState(false);
  const [detayId,   setDetayId]   = useState<string | null>(null);
  const [hata,      setHata]      = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    tip: "fatura", tarih: new Date().toISOString().slice(0, 10),
    musteriAdi: "", musteriAdres: "", notlar: "", kalemler: [{ ...BOSLUK_KALEM }],
  });

  useEffect(() => {
    apiGetFaturalar().then((d) => { setListe(d as Fatura[]); setLoading(false); });
  }, []);

  function kalemGuncelle(i: number, alan: keyof FaturaKalem, deger: string | number) {
    setForm(p => {
      const k = [...p.kalemler];
      k[i] = { ...k[i], [alan]: alan === "urunAdi" || alan === "birim" ? deger : Number(deger) };
      return { ...p, kalemler: k };
    });
  }

  function kalemEkle() { setForm(p => ({ ...p, kalemler: [...p.kalemler, { ...BOSLUK_KALEM }] })); }
  function kalemSil(i: number) {
    setForm(p => ({ ...p, kalemler: p.kalemler.filter((_, j) => j !== i) }));
  }

  async function handleKaydet(durum: "taslak" | "kesildi") {
    if (!form.musteriAdi.trim()) { setHata("Müşteri adı zorunludur."); return; }
    if (form.kalemler.some(k => !k.urunAdi.trim())) { setHata("Tüm kalemlerin ürün adı girilmelidir."); return; }
    setHata("");
    const { araToplam, kdvToplam, genelToplam } = hesapla(form.kalemler);
    const yeni = {
      faturaNo: faturaNoUret(liste, form.tip),
      tip: form.tip, tarih: form.tarih, musteriAdi: form.musteriAdi.trim(),
      musteriAdres: form.musteriAdres || undefined,
      kalemler: form.kalemler, araToplam, kdvToplam, genelToplam,
      durum, notlar: form.notlar || undefined,
    };
    const { id } = await apiAddFatura(yeni);
    setListe(p => [{ ...yeni, id, durum } as Fatura, ...p]);
    setFormAcik(false);
    setForm({ tip: "fatura", tarih: new Date().toISOString().slice(0, 10), musteriAdi: "", musteriAdres: "", notlar: "", kalemler: [{ ...BOSLUK_KALEM }] });
  }

  async function handleDurumDegistir(f: Fatura, durum: Fatura["durum"]) {
    await apiUpdateFaturaDurum(f.id, durum);
    setListe(p => p.map(x => x.id === f.id ? { ...x, durum } : x));
  }

  async function handleSil() {
    if (!silId) return;
    try {
      await apiDeleteFatura(silId);
      setListe(p => p.filter(x => x.id !== silId));
      if (detayId === silId) setDetayId(null);
      toast("Fatura silindi.", "basari");
    } catch { toast("Silinemedi.", "hata"); }
    finally { setSilId(null); }
  }

  function handleYazdir(f: Fatura) {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>${f.faturaNo}</title>
    <style>
      body { font-family: Arial,sans-serif; padding: 32px; color: #1e293b; }
      h1 { font-size: 22px; margin:0; } .sub { color:#64748b; font-size:14px; }
      .row { display:flex; justify-content:space-between; margin-bottom:24px; }
      table { width:100%; border-collapse:collapse; margin:24px 0; }
      th { background:#f1f5f9; text-align:left; padding:8px 12px; font-size:12px; border-bottom:2px solid #e2e8f0; }
      td { padding:8px 12px; font-size:13px; border-bottom:1px solid #e2e8f0; }
      .totals { max-width:300px; margin-left:auto; }
      .totals td { border:none; }
      .total-row td { font-weight:bold; font-size:15px; border-top:2px solid #1e293b; padding-top:10px; }
      @media print { button{display:none} }
    </style></head><body>
    <div class="row">
      <div><h1>NexPlan ERP</h1><p class="sub">${f.tip === "fatura" ? "FATURA" : "İRSALİYE"}</p></div>
      <div style="text-align:right"><b style="font-size:18px">${f.faturaNo}</b><br/><span class="sub">${new Date(f.tarih).toLocaleDateString("tr-TR")}</span></div>
    </div>
    <div class="row"><div><b>Müşteri:</b> ${f.musteriAdi}${f.musteriAdres ? `<br/><span class="sub">${f.musteriAdres}</span>` : ""}</div></div>
    <table><thead><tr><th>Ürün / Hizmet</th><th>Miktar</th><th>Birim</th><th>Birim Fiyat</th><th>KDV %</th><th>Tutar</th></tr></thead>
    <tbody>${f.kalemler.map(k => `<tr><td>${k.urunAdi}</td><td>${k.miktar}</td><td>${k.birim}</td><td>${k.birimFiyat.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td><td>%${k.kdvOrani}</td><td>${(k.miktar*k.birimFiyat).toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td></tr>`).join("")}</tbody></table>
    <table class="totals"><tr><td>Ara Toplam</td><td style="text-align:right">${f.araToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td></tr>
    <tr><td>KDV</td><td style="text-align:right">${f.kdvToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td></tr>
    <tr class="total-row"><td>GENEL TOPLAM</td><td style="text-align:right">${f.genelToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td></tr></table>
    ${f.notlar ? `<p style="font-size:13px;color:#64748b">Not: ${f.notlar}</p>` : ""}
    <script>window.onload=()=>{window.print();}</script></body></html>`);
    w.document.close();
  }

  const detay = liste.find(f => f.id === detayId);
  const { araToplam, kdvToplam, genelToplam } = hesapla(form.kalemler);

  return (
    <PageLayout baslik="Fatura / İrsaliye" altyazi="Fatura ve irsaliye oluştur, yönet"
      sagIcerik={
        <button onClick={() => setFormAcik(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
          <PlusCircle size={16} /> Yeni Belge
        </button>
      }
    >

        {/* Özet kartlar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Toplam Belge",  value: liste.length,                                  renk: "text-blue-600"   },
            { label: "Taslak",        value: liste.filter(f=>f.durum==="taslak").length,     renk: "text-slate-600"  },
            { label: "Kesildi",       value: liste.filter(f=>f.durum==="kesildi").length,    renk: "text-emerald-600"},
            { label: "Toplam Ciro",   value: liste.filter(f=>f.durum==="kesildi").reduce((t,f)=>t+f.genelToplam,0).toLocaleString("tr-TR",{minimumFractionDigits:2})+" ₺", renk: "text-violet-600" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs uppercase tracking-wide">{c.label}</p>
              <p className={`${c.renk} text-2xl font-bold mt-1`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Yeni belge formu */}
        {formAcik && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-500" /> Yeni Belge</h2>
              <button onClick={() => setFormAcik(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>

            {/* Tip / Tarih / Müşteri */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Belge Tipi</label>
                <select value={form.tip} onChange={e => setForm(p=>({...p, tip: e.target.value as FaturaTip}))}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="fatura">Fatura</option>
                  <option value="irsaliye">İrsaliye</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Tarih</label>
                <input type="date" value={form.tarih} onChange={e => setForm(p=>({...p, tarih: e.target.value}))}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Müşteri Adı *</label>
                <input value={form.musteriAdi} onChange={e => setForm(p=>({...p, musteriAdi: e.target.value}))}
                  placeholder="ör. ABC Sanayi A.Ş."
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Müşteri Adresi</label>
              <input value={form.musteriAdres} onChange={e => setForm(p=>({...p, musteriAdres: e.target.value}))}
                placeholder="ör. İstanbul, Türkiye"
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>

            {/* Kalemler */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Kalemler</label>
                <button onClick={kalemEkle} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium">
                  <Plus size={13}/> Kalem Ekle
                </button>
              </div>
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-12 gap-2 px-2">
                  {["Ürün / Hizmet","Miktar","Birim","Birim Fiyat ₺","KDV %",""].map(h=>(
                    <span key={h} className={`text-slate-400 text-xs uppercase tracking-wide ${h==="Ürün / Hizmet"?"col-span-4":h===""?"col-span-1":"col-span-2"}`}>{h}</span>
                  ))}
                </div>
                {form.kalemler.map((k, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2">
                    <input value={k.urunAdi} onChange={e=>kalemGuncelle(i,"urunAdi",e.target.value)}
                      placeholder="Ürün / hizmet adı" className="col-span-12 sm:col-span-4 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-300"/>
                    <input value={k.miktar} onChange={e=>kalemGuncelle(i,"miktar",e.target.value)} type="number" min="0" step="0.01"
                      className="col-span-4 sm:col-span-2 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-300"/>
                    <input value={k.birim} onChange={e=>kalemGuncelle(i,"birim",e.target.value)} placeholder="adet"
                      className="col-span-4 sm:col-span-2 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-300"/>
                    <input value={k.birimFiyat} onChange={e=>kalemGuncelle(i,"birimFiyat",e.target.value)} type="number" min="0" step="0.01"
                      className="col-span-4 sm:col-span-2 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-300"/>
                    <select value={k.kdvOrani} onChange={e=>kalemGuncelle(i,"kdvOrani",e.target.value)}
                      className="col-span-3 sm:col-span-1 bg-white border border-slate-200 rounded px-1 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-300">
                      <option value={0}>%0</option>
                      <option value={10}>%10</option>
                      <option value={20}>%20</option>
                    </select>
                    <button onClick={()=>kalemSil(i)} disabled={form.kalemler.length===1}
                      className="col-span-1 flex justify-center text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>

              {/* Toplamlar */}
              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Ara Toplam</span><span>{araToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</span></div>
                  <div className="flex justify-between text-slate-600"><span>KDV</span><span>{kdvToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</span></div>
                  <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-200 pt-1.5">
                    <span>Genel Toplam</span><span>{genelToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Notlar</label>
              <textarea value={form.notlar} onChange={e=>setForm(p=>({...p, notlar: e.target.value}))} rows={2} placeholder="Ödeme koşulları, açıklamalar…"
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" />
            </div>

            {hata && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{hata}</p>}

            <div className="flex justify-end gap-3">
              <button onClick={()=>handleKaydet("taslak")} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
                Taslak Kaydet
              </button>
              <button onClick={()=>handleKaydet("kesildi")} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                <FileText size={15}/> Kes &amp; Kaydet
              </button>
            </div>
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">Yükleniyor…</div>
        ) : liste.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200">
            <EmptyState ikon={FileText} baslik="Henüz fatura veya irsaliye yok"
              aciklama="Müşterinize ilk belgeyi oluşturmak için sağ üstteki butona tıklayın." />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold flex items-center gap-2"><FileText size={17} className="text-blue-500"/> Belgeler</h2>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Belge No","Tip","Tarih","Müşteri","Toplam","Durum",""].map(h=>(
                  <th key={h} className="px-5 py-3 text-left text-slate-500 text-xs uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {liste.map((f, i) => (
                  <>
                    <tr key={f.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${i%2!==0?"bg-slate-50/50":""}`}
                      onClick={()=>setDetayId(detayId===f.id?null:f.id)}>
                      <td className="px-5 py-3.5 font-medium text-blue-600">{f.faturaNo}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${f.tip==="fatura"?"text-blue-600 bg-blue-100":"text-violet-600 bg-violet-100"}`}>
                          {f.tip==="fatura"?"Fatura":"İrsaliye"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{new Date(f.tarih).toLocaleDateString("tr-TR")}</td>
                      <td className="px-5 py-3.5 text-slate-800">{f.musteriAdi}</td>
                      <td className="px-5 py-3.5 text-slate-800 font-medium">{f.genelToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td>
                      <td className="px-5 py-3.5">
                        <select value={f.durum} onClick={e=>e.stopPropagation()}
                          onChange={e=>{e.stopPropagation(); handleDurumDegistir(f, e.target.value as Fatura["durum"]);}}
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none ${DURUM_RENGI[f.durum]}`}>
                          <option value="taslak">Taslak</option>
                          <option value="kesildi">Kesildi</option>
                          <option value="iptal">İptal</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1" onClick={e=>e.stopPropagation()}>
                          <button onClick={()=>handleYazdir(f)} title="Yazdır"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Printer size={14}/>
                          </button>
                          <button onClick={e=>{e.stopPropagation();setSilId(f.id);}} title="Sil"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14}/>
                          </button>
                          {detayId===f.id ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                        </div>
                      </td>
                    </tr>
                    {detayId===f.id && (
                      <tr key={`${f.id}-detay`} className="bg-blue-50/30">
                        <td colSpan={7} className="px-5 py-4">
                          <table className="w-full text-sm">
                            <thead><tr className="text-slate-500 text-xs uppercase tracking-wide">
                              <th className="text-left pb-2">Ürün / Hizmet</th>
                              <th className="text-right pb-2">Miktar</th>
                              <th className="text-right pb-2">Birim</th>
                              <th className="text-right pb-2">Birim Fiyat</th>
                              <th className="text-right pb-2">KDV</th>
                              <th className="text-right pb-2">Tutar</th>
                            </tr></thead>
                            <tbody>
                              {f.kalemler.map((k, ki) => (
                                <tr key={ki} className="border-t border-blue-100">
                                  <td className="py-1.5 text-slate-800">{k.urunAdi}</td>
                                  <td className="py-1.5 text-right text-slate-600">{k.miktar}</td>
                                  <td className="py-1.5 text-right text-slate-600">{k.birim}</td>
                                  <td className="py-1.5 text-right text-slate-600">{k.birimFiyat.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td>
                                  <td className="py-1.5 text-right text-slate-600">%{k.kdvOrani}</td>
                                  <td className="py-1.5 text-right font-medium text-slate-800">{(k.miktar*k.birimFiyat).toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td>
                                </tr>
                              ))}
                              <tr className="border-t-2 border-slate-300">
                                <td colSpan={4}/>
                                <td className="py-2 text-right text-xs text-slate-500">Ara: {f.araToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺ · KDV: {f.kdvToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td>
                                <td className="py-2 text-right font-bold text-slate-800">{f.genelToplam.toLocaleString("tr-TR",{minimumFractionDigits:2})} ₺</td>
                              </tr>
                            </tbody>
                          </table>
                          {f.notlar && <p className="mt-2 text-slate-500 text-xs">Not: {f.notlar}</p>}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <div ref={printRef}/>
      <ConfirmModal acik={silId !== null} mesaj="Bu faturayı silmek istiyor musunuz?" onOnayla={handleSil} onIptal={() => setSilId(null)} />
    </PageLayout>
  );
}
