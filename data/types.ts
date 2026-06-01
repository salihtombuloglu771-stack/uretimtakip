// ─── İş Emri ─────────────────────────────────────────────────────────────────
export interface IsEmri {
  id: string;
  isEmriNo: string;
  makinaNo: string;
  urunAdi: string;
  uretimAdedi: number;
  fireAdedi: number;
  birimFiyat: number;
  hedefAdedi?: number;                          // opsiyonel — eski kayıtlar bozulmasın
  vardiya?: "sabah" | "oglen" | "gece";         // opsiyonel — eski kayıtlar bozulmasın
  tarih: string;
}
export type YeniIsEmri = Omit<IsEmri, "id">;

// ─── Makina ───────────────────────────────────────────────────────────────────
export interface Makina {
  id: string;
  makinaNo: string;
  makinaAdi: string;
  durum: "aktif" | "pasif";
  sonBakimTarihi?: string;       // YYYY-MM-DD
  bakimPeriyoduGun?: number;     // kaç günde bir bakım yapılmalı
}
export type YeniMakina = Omit<Makina, "id">;

// ─── Ürün Kataloğu ────────────────────────────────────────────────────────────
export interface Urun {
  id: string;
  urunKodu: string;
  urunAdi: string;
  birimFiyat: number;
}
export type YeniUrun = Omit<Urun, "id">;

// ─── Duruş Kaydı ─────────────────────────────────────────────────────────────
export type DurusNeden = "ariza" | "bakim" | "malzeme" | "kalip" | "diger";

export interface Durus {
  id: string;
  makinaNo: string;
  baslangicTarihi: string;   // YYYY-MM-DDTHH:mm
  bitisTarihi: string;       // YYYY-MM-DDTHH:mm
  neden: DurusNeden;
  aciklama: string;
}
export type YeniDurus = Omit<Durus, "id">;

// ─── Kullanıcı Rolü ──────────────────────────────────────────────────────────
export type KullaniciRol = "admin" | "operatör";
