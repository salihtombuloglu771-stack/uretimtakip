import type { KullaniciRol } from "@/data/types";

// ── Rol etiketleri ────────────────────────────────────────────────────────────
export const ROL_ETIKETI: Record<KullaniciRol, string> = {
  admin:            "Admin",
  operatör:         "Operatör",
  üretim_sorumlusu: "Üretim Sorumlusu",
  kalite_sorumlusu: "Kalite Sorumlusu",
  depo_sorumlusu:   "Depo Sorumlusu",
  proje_sorumlusu:  "Proje Sorumlusu",
};

// ── Rol renkleri (badge için) ─────────────────────────────────────────────────
export const ROL_RENGI: Record<KullaniciRol, string> = {
  admin:            "text-violet-600 bg-violet-100",
  operatör:         "text-emerald-600 bg-emerald-100",
  üretim_sorumlusu: "text-blue-600   bg-blue-100",
  kalite_sorumlusu: "text-orange-600 bg-orange-100",
  depo_sorumlusu:   "text-teal-600   bg-teal-100",
  proje_sorumlusu:  "text-pink-600   bg-pink-100",
};

// ── Sayfa izinleri ────────────────────────────────────────────────────────────
type Roller = KullaniciRol[];
const TUM: Roller = ["admin","operatör","üretim_sorumlusu","kalite_sorumlusu","depo_sorumlusu","proje_sorumlusu"];

export const SAYFA_ROLLER: Record<string, Roller> = {
  "/anasayfa":         TUM,
  "/mesajlar":         TUM,
  "/raporlar":         ["admin","üretim_sorumlusu","kalite_sorumlusu","depo_sorumlusu","proje_sorumlusu"],
  "/uretim-emri":      ["admin","operatör","üretim_sorumlusu","proje_sorumlusu"],
  "/is-emirleri":      ["admin","operatör","üretim_sorumlusu","kalite_sorumlusu","proje_sorumlusu"],
  "/operasyon-takibi": ["admin","operatör","üretim_sorumlusu","proje_sorumlusu"],
  "/kalite-kontrol":   ["admin","kalite_sorumlusu","üretim_sorumlusu"],
  "/urun-katalogu":    ["admin","üretim_sorumlusu","depo_sorumlusu","proje_sorumlusu"],
  "/durus-kaydi":      ["admin","operatör","üretim_sorumlusu"],
  "/makinalar":        ["admin","üretim_sorumlusu"],
  "/personel":         ["admin"],
  "/depo":             ["admin","üretim_sorumlusu","depo_sorumlusu"],
  "/malzeme":          ["admin","üretim_sorumlusu","depo_sorumlusu"],
  "/sabit-kiymet":     ["admin","depo_sorumlusu"],
  "/kullanicilar":     ["admin"],
  "/fatura":           ["admin","proje_sorumlusu"],
  "/projeler":         ["admin","proje_sorumlusu"],
};

export function erisimVar(rol: KullaniciRol | null, sayfa: string): boolean {
  if (!rol) return false;
  if (rol === "admin") return true;
  const roller = SAYFA_ROLLER[sayfa] ?? ["admin"];
  return roller.includes(rol);
}
