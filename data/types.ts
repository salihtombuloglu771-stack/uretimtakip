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
  kayitYapan?: string;
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
export type KullaniciRol =
  | "admin"
  | "operatör"
  | "üretim_sorumlusu"
  | "kalite_sorumlusu"
  | "depo_sorumlusu"
  | "proje_sorumlusu";

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
  kayitYapan?: string;
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
  kayitYapan?: string;
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

// ─── Fatura / İrsaliye ───────────────────────────────────────────────────────
export type FaturaTip    = "fatura" | "irsaliye";
export type FaturaDurum  = "taslak" | "kesildi" | "iptal";
export type KdvOrani     = 0 | 10 | 20;

export interface FaturaKalem {
  urunAdi:    string;
  miktar:     number;
  birim:      string;
  birimFiyat: number;
  kdvOrani:   KdvOrani;
}

export interface Fatura {
  id:           string;
  faturaNo:     string;
  tip:          FaturaTip;
  tarih:        string;
  musteriAdi:   string;
  musteriAdres?: string;
  kalemler:     FaturaKalem[];
  araToplam:    number;
  kdvToplam:    number;
  genelToplam:  number;
  durum:        FaturaDurum;
  notlar?:      string;
  olusturan?:   string;
}

// ─── Proje Yönetim ───────────────────────────────────────────────────────────
export type ProjeDurum = "planlama" | "aktif" | "tamamlandi" | "iptal";
export type GorevDurum = "bekliyor" | "devam_ediyor" | "tamamlandi";

export interface Proje {
  id:              string;
  projeKodu:       string;
  projeAdi:        string;
  musteri?:        string;
  baslangicTarihi?: string;
  bitisTarihi?:    string;
  sorumlu?:        string;
  durum:           ProjeDurum;
  aciklama?:       string;
  butce?:          number;
  olusturan?:      string;
}

export interface ProjeGorev {
  id:           string;
  projeId:      string;
  gorevAdi:     string;
  atanan?:      string;
  bitisTarihi?: string;
  durum:        GorevDurum;
}

// ─── Mesajlaşma ───────────────────────────────────────────────────────────────
export interface Mesaj {
  id: string;
  gonderen: string;       // kullanıcı adı
  alici: string;          // kullanıcı adı
  icerik: string;
  tarih: string;          // ISO datetime
  okundu: boolean;
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
  kayitYapan?: string;
}
