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

// ─── Operasyon Takibi ─────────────────────────────────────────────────────────
export interface Operasyon {
  id: string;
  isEmriId: string;
  isEmriNo: string;
  urunAdi: string;
  makinaNo?: string;
  baslangic: string;   // ISO datetime string
  bitis?: string;      // ISO datetime string — undefined = hala aktif
}

// ─── Depo Hareketi ────────────────────────────────────────────────────────────
export type DepoTuru     = "sevkiyat" | "uretim";
export type HareketTuru  = "giris" | "cikis";

export interface DepoHareketi {
  id: string;
  depoTuru: DepoTuru;
  urunAdi: string;
  miktar: number;
  birim: string;
  hareketTuru: HareketTuru;
  tarih: string;
  aciklama?: string;
}

// ─── Malzeme ──────────────────────────────────────────────────────────────────
export interface Malzeme {
  id: string;
  malzemeKodu: string;
  malzemeAdi: string;
  birim: string;
  stokMiktari: number;
  birimFiyat?: number;
  fotograf?: string;   // base64 data URL
}

// ─── Sabit Kıymet / Demirbaş ─────────────────────────────────────────────────
export interface DemirbasKayit {
  id: string;
  demirbasNo: string;
  demirbasAdi: string;
  konum?: string;
  alisTarihi?: string;
  alisFiyati?: number;
  durum: "aktif" | "pasif";
}

// ─── Personel ─────────────────────────────────────────────────────────────────
export interface Personel {
  id: string;
  sicilNo: string;
  adSoyad: string;
  departman: string;
  pozisyon: string;
  vardiya?: "sabah" | "oglen";
  durum: "aktif" | "pasif";
  iseGirisTarihi?: string;
}

// ─── Kullanıcı Yönetimi ───────────────────────────────────────────────────────
export interface Kullanici {
  id: string;
  kullaniciAdi: string;
  rol: KullaniciRol;
}

// ─── Kalite Kontrol ───────────────────────────────────────────────────────────
export type KaliteKontrolSonuc = "gecti" | "kaldi";

export interface KaliteKontrol {
  id: string;
  isEmriNo: string;
  urunAdi: string;
  kontrolTarihi: string;
  kontrolEden: string;
  uygunAdet: number;
  uygunsuzAdet: number;
  sonuc: KaliteKontrolSonuc;
  aciklama?: string;
}
