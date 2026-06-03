"use client";


import { apiGetKullanicilar } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { MessageSquare, Send, Trash2, CheckCheck, Inbox, SendHorizonal } from "lucide-react";
import { getMesajlar, addMesaj, markOkundu, deleteMesaj } from "@/lib/mesajlar";

import type { Mesaj } from "@/data/types";

const FALLBACK_KULLANICILAR = ["admin", "operatör"];

export default function MesajlarPage() {
  const [mesajlar,    setMesajlar]    = useState<Mesaj[]>([]);
  const [kullanicilar, setKullanicilar] = useState<string[]>([]);
  const [benimAdi,    setBenimAdi]    = useState("");
  const [alici,       setAlici]       = useState("");
  const [icerik,      setIcerik]      = useState("");
  const [sekme,       setSekme]       = useState<"gelen" | "giden">("gelen");
  const [secili,      setSecili]      = useState<Mesaj | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const yenile = () => getMesajlar().then(setMesajlar);

  useEffect(() => {
    const ad = localStorage.getItem("uretim_kullanici_adi") ?? "";
    setBenimAdi(ad);
    yenile();

    apiGetKullanicilar().then((data) => {
      const liste = data.map((k) => k.kullaniciAdi);
      const hepsi = Array.from(new Set([...FALLBACK_KULLANICILAR, ...liste]));
      setKullanicilar(hepsi.filter((k) => k !== ad));
    });

    const id = setInterval(yenile, 10_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!alici || !icerik.trim()) return;
    addMesaj(benimAdi, alici, icerik.trim()).then(yenile);
    setIcerik("");
    textareaRef.current?.focus();
  }

  function mesajaGit(m: Mesaj) {
    setSecili(m);
    if (m.alici === benimAdi && !m.okundu) {
      markOkundu(m.id).then(yenile);
    }
  }

  function sil(id: string) {
    deleteMesaj(id).then(yenile);
    if (secili?.id === id) setSecili(null);
  }

  const gelen = mesajlar.filter((m) => m.alici === benimAdi);
  const giden  = mesajlar.filter((m) => m.gonderen === benimAdi);
  const gorunen = sekme === "gelen" ? gelen : giden;
  const okunmamis = gelen.filter((m) => !m.okundu).length;

  function formatTarih(iso: string) {
    const d = new Date(iso);
    const bugun = new Date();
    const dun   = new Date(bugun); dun.setDate(dun.getDate() - 1);
    if (d.toDateString() === bugun.toDateString())
      return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === dun.toDateString()) return "Dün";
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-bold flex items-center gap-2">
              <MessageSquare size={22} className="text-blue-500" /> Mesajlar
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Kullanıcılar arası iç mesajlaşma</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Sol: Liste + Gönder ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Yeni mesaj formu */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-slate-700 font-semibold text-sm mb-4 flex items-center gap-2">
                <Send size={15} className="text-blue-500" /> Yeni Mesaj
              </h2>
              <form onSubmit={gonder} className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Alıcı</label>
                  <select
                    value={alici}
                    onChange={(e) => setAlici(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">— Kullanıcı seç —</option>
                    {kullanicilar.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide">Mesaj</label>
                  <textarea
                    ref={textareaRef}
                    value={icerik}
                    onChange={(e) => setIcerik(e.target.value)}
                    rows={3}
                    placeholder="Mesajınızı yazın…"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!alici || !icerik.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  <SendHorizonal size={14} /> Gönder
                </button>
              </form>
            </div>

            {/* Sekme: Gelen / Giden */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setSekme("gelen")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    sekme === "gelen"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Inbox size={13} /> Gelen
                  {okunmamis > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {okunmamis}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSekme("giden")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    sekme === "giden"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Send size={13} /> Gönderilen
                </button>
              </div>

              {gorunen.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                  <MessageSquare size={32} />
                  <p className="text-xs text-slate-400">
                    {sekme === "gelen" ? "Gelen mesaj yok." : "Gönderilen mesaj yok."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {gorunen.map((m) => {
                    const aktif  = secili?.id === m.id;
                    const yeni   = sekme === "gelen" && !m.okundu;
                    return (
                      <li key={m.id}>
                        <button
                          onClick={() => mesajaGit(m)}
                          className={`w-full text-left px-4 py-3 transition-colors ${
                            aktif ? "bg-blue-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-semibold truncate max-w-[120px] ${yeni ? "text-blue-600" : "text-slate-700"}`}>
                              {sekme === "gelen" ? m.gonderen : m.alici}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">{formatTarih(m.tarih)}</span>
                          </div>
                          <p className={`text-xs truncate ${yeni ? "text-slate-800 font-medium" : "text-slate-500"}`}>
                            {m.icerik}
                          </p>
                          {yeni && (
                            <span className="inline-block mt-1 w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── Sağ: Mesaj detayı ── */}
          <div className="lg:col-span-2">
            {secili ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">
                      {secili.alici === benimAdi
                        ? <>Kimden: <span className="text-blue-600">{secili.gonderen}</span></>
                        : <>Kime: <span className="text-blue-600">{secili.alici}</span></>}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {new Date(secili.tarih).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {secili.alici === benimAdi && secili.okundu && (
                      <span className="flex items-center gap-1 text-emerald-500 text-xs">
                        <CheckCheck size={13} /> Okundu
                      </span>
                    )}
                    <button
                      onClick={() => sil(secili.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{secili.icerik}</p>
                </div>

                {/* Hızlı yanıt */}
                {secili.alici === benimAdi && (
                  <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Yanıtla</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const ta = e.currentTarget.querySelector("textarea") as HTMLTextAreaElement;
                        if (!ta.value.trim()) return;
                        addMesaj(benimAdi, secili.gonderen, ta.value.trim()).then(yenile);
                        ta.value = "";
                      }}
                      className="flex gap-2"
                    >
                      <textarea
                        rows={2}
                        placeholder={`${secili.gonderen} kişisine yanıt yaz…`}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                      />
                      <button
                        type="submit"
                        className="self-end flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        <SendHorizonal size={13} /> Gönder
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-64 flex flex-col items-center justify-center gap-3 text-slate-300">
                <MessageSquare size={40} />
                <p className="text-sm text-slate-400">Okumak için bir mesaj seç.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
