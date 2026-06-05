import { Pool } from "pg";

let pool: Pool | null = null;

export function getPgPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("railway.internal") ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function migratePg(): Promise<void> {
  const db = getPgPool();
  if (!db) { console.log("⚠️  DATABASE_URL yok, PG migration atlandı"); return; }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS faturalar (
        id            TEXT PRIMARY KEY,
        fatura_no     TEXT UNIQUE NOT NULL,
        tip           TEXT NOT NULL DEFAULT 'fatura',
        tarih         TEXT NOT NULL,
        musteri_adi   TEXT NOT NULL,
        musteri_adres TEXT,
        kalemler      JSONB DEFAULT '[]',
        ara_toplam    REAL DEFAULT 0,
        kdv_toplam    REAL DEFAULT 0,
        genel_toplam  REAL DEFAULT 0,
        durum         TEXT NOT NULL DEFAULT 'taslak',
        notlar        TEXT,
        olusturan     TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS projeler (
        id                TEXT PRIMARY KEY,
        proje_kodu        TEXT UNIQUE NOT NULL,
        proje_adi         TEXT NOT NULL,
        musteri           TEXT,
        baslangic_tarihi  TEXT,
        bitis_tarihi      TEXT,
        sorumlu           TEXT,
        durum             TEXT NOT NULL DEFAULT 'planlama',
        aciklama          TEXT,
        butce             REAL,
        olusturan         TEXT,
        created_at        TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS proje_gorevleri (
        id            TEXT PRIMARY KEY,
        proje_id      TEXT NOT NULL,
        gorev_adi     TEXT NOT NULL,
        atanan        TEXT,
        bitis_tarihi  TEXT,
        durum         TEXT NOT NULL DEFAULT 'bekliyor',
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ PG migration tamamlandı (faturalar, projeler, proje_gorevleri)");
  } catch (e) {
    console.error("⚠️  PG migration hatası:", e);
  }
}
