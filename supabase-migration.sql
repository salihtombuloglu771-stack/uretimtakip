-- NexPlan Supabase Migration
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- https://supabase.com/dashboard/project/ajuknbinpumzjvzpwmrn/editor

-- ── Kullanıcılar ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kullanicilar (
  id            TEXT PRIMARY KEY,
  kullanici_adi TEXT UNIQUE NOT NULL,
  sifre         TEXT NOT NULL,
  rol           TEXT NOT NULL DEFAULT 'operatör',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── İş Emirleri ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS is_emirleri (
  id            TEXT PRIMARY KEY,
  is_emri_no    TEXT UNIQUE NOT NULL,
  makina_no     TEXT,
  urun_adi      TEXT NOT NULL,
  uretim_adedi  INTEGER NOT NULL DEFAULT 0,
  fire_adedi    INTEGER NOT NULL DEFAULT 0,
  birim_fiyat   REAL DEFAULT 0,
  hedef_adedi   INTEGER,
  vardiya       TEXT,
  tarih         TEXT NOT NULL,
  kayit_yapan   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Makinalar ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS makinalar (
  id                 TEXT PRIMARY KEY,
  makina_no          TEXT UNIQUE NOT NULL,
  makina_adi         TEXT NOT NULL,
  durum              TEXT NOT NULL DEFAULT 'aktif',
  son_bakim_tarihi   TEXT,
  bakim_periyodu_gun INTEGER,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Malzeme ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS malzeme (
  id            TEXT PRIMARY KEY,
  malzeme_kodu  TEXT UNIQUE NOT NULL,
  malzeme_adi   TEXT NOT NULL,
  birim         TEXT NOT NULL,
  stok_miktari  REAL NOT NULL DEFAULT 0,
  birim_fiyat   REAL,
  fotograf      TEXT,
  kayit_yapan   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Kalite Kontrol ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kalite_kontrol (
  id              TEXT PRIMARY KEY,
  is_emri_no      TEXT NOT NULL,
  urun_adi        TEXT NOT NULL,
  kontrol_tarihi  TEXT NOT NULL,
  kontrol_eden    TEXT NOT NULL,
  uygun_adet      INTEGER NOT NULL DEFAULT 0,
  uygunsuz_adet   INTEGER NOT NULL DEFAULT 0,
  sonuc           TEXT NOT NULL,
  aciklama        TEXT,
  kayit_yapan     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ürün Kataloğu ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS urunler (
  id          TEXT PRIMARY KEY,
  urun_kodu   TEXT UNIQUE NOT NULL,
  urun_adi    TEXT NOT NULL,
  birim_fiyat REAL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Duruş Kayıtları ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS durus_kayitlari (
  id                TEXT PRIMARY KEY,
  makina_no         TEXT NOT NULL,
  baslangic_tarihi  TEXT NOT NULL,
  bitis_tarihi      TEXT NOT NULL,
  neden             TEXT NOT NULL,
  aciklama          TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Operasyonlar ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operasyonlar (
  id          TEXT PRIMARY KEY,
  is_emri_id  TEXT NOT NULL,
  is_emri_no  TEXT NOT NULL,
  urun_adi    TEXT NOT NULL,
  makina_no   TEXT,
  baslangic   TEXT NOT NULL,
  bitis       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Depo Hareketleri ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS depo_hareketleri (
  id            TEXT PRIMARY KEY,
  depo_turu     TEXT NOT NULL,
  urun_adi      TEXT NOT NULL,
  miktar        REAL NOT NULL,
  birim         TEXT NOT NULL,
  hareket_turu  TEXT NOT NULL,
  tarih         TEXT NOT NULL,
  aciklama      TEXT,
  kayit_yapan   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Demirbaşlar ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demirbaslar (
  id            TEXT PRIMARY KEY,
  demirbas_no   TEXT UNIQUE NOT NULL,
  demirbas_adi  TEXT NOT NULL,
  konum         TEXT,
  alis_tarihi   TEXT,
  alis_fiyati   REAL,
  durum         TEXT NOT NULL DEFAULT 'aktif',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Personel ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personel (
  id                TEXT PRIMARY KEY,
  sicil_no          TEXT UNIQUE NOT NULL,
  ad_soyad          TEXT NOT NULL,
  departman         TEXT,
  pozisyon          TEXT,
  vardiya           TEXT,
  durum             TEXT NOT NULL DEFAULT 'aktif',
  ise_giris_tarihi  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Mesajlar ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mesajlar (
  id        TEXT PRIMARY KEY,
  gonderen  TEXT NOT NULL,
  alici     TEXT NOT NULL,
  icerik    TEXT NOT NULL,
  tarih     TIMESTAMPTZ DEFAULT NOW(),
  okundu    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security (RLS) — Tüm tablolarda kapat (backend JWT ile korur) ──
ALTER TABLE kullanicilar    DISABLE ROW LEVEL SECURITY;
ALTER TABLE is_emirleri     DISABLE ROW LEVEL SECURITY;
ALTER TABLE makinalar       DISABLE ROW LEVEL SECURITY;
ALTER TABLE malzeme         DISABLE ROW LEVEL SECURITY;
ALTER TABLE kalite_kontrol  DISABLE ROW LEVEL SECURITY;
ALTER TABLE urunler         DISABLE ROW LEVEL SECURITY;
ALTER TABLE durus_kayitlari DISABLE ROW LEVEL SECURITY;
ALTER TABLE operasyonlar    DISABLE ROW LEVEL SECURITY;
ALTER TABLE depo_hareketleri DISABLE ROW LEVEL SECURITY;
ALTER TABLE demirbaslar     DISABLE ROW LEVEL SECURITY;
ALTER TABLE personel        DISABLE ROW LEVEL SECURITY;
ALTER TABLE mesajlar        DISABLE ROW LEVEL SECURITY;

-- ── Varsayılan Kullanıcılar ───────────────────────────────────────────────────
INSERT INTO kullanicilar (id, kullanici_adi, sifre, rol)
VALUES
  (gen_random_uuid()::text, 'admin',    '1234', 'admin'),
  (gen_random_uuid()::text, 'operatör', '1234', 'operatör')
ON CONFLICT (kullanici_adi) DO NOTHING;
