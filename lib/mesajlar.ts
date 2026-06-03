import { supabase } from "./supabase";
import type { Mesaj } from "@/data/types";

// ─── localStorage yedek (Supabase tablo yokken çalışır) ──────────────────────
const LS_KEY = "uretim_mesajlar";

function lsOku(): Mesaj[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}
function lsYaz(list: Mesaj[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ─── Yardımcı ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map = (r: any): Mesaj => ({
  id: r.id, gonderen: r.gonderen, alici: r.alici,
  icerik: r.icerik, tarih: r.tarih, okundu: r.okundu,
});

// ─── API ──────────────────────────────────────────────────────────────────────
export async function getMesajlar(): Promise<Mesaj[]> {
  const { data, error } = await supabase
    .from("mesajlar").select("*").order("tarih", { ascending: false });
  if (error || !data) {
    return lsOku().sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
  }
  return data.map(map);
}

export async function addMesaj(gonderen: string, alici: string, icerik: string): Promise<Mesaj> {
  const yeni: Mesaj = {
    id: crypto.randomUUID(), gonderen, alici, icerik,
    tarih: new Date().toISOString(), okundu: false,
  };
  const { error } = await supabase.from("mesajlar").insert({
    id: yeni.id, gonderen, alici, icerik, okundu: false,
  });
  if (error) {
    lsYaz([...lsOku(), yeni]);
  }
  return yeni;
}

export async function markOkundu(id: string): Promise<void> {
  const { error } = await supabase.from("mesajlar").update({ okundu: true }).eq("id", id);
  if (error) {
    lsYaz(lsOku().map((m) => (m.id === id ? { ...m, okundu: true } : m)));
  }
}

export async function deleteMesaj(id: string): Promise<void> {
  const { error } = await supabase.from("mesajlar").delete().eq("id", id);
  if (error) {
    lsYaz(lsOku().filter((m) => m.id !== id));
  }
}

export async function okunmamisSayisi(kullaniciAdi: string): Promise<number> {
  const { count, error } = await supabase
    .from("mesajlar")
    .select("*", { count: "exact", head: true })
    .eq("alici", kullaniciAdi)
    .eq("okundu", false);
  if (error) {
    return lsOku().filter((m) => m.alici === kullaniciAdi && !m.okundu).length;
  }
  return count ?? 0;
}
