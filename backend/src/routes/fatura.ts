import { Router, Response } from "express";
import { getPgPool } from "../config/pgdb";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map = (r: any) => ({
  id: r.id, faturaNo: r.fatura_no, tip: r.tip, tarih: r.tarih,
  musteriAdi: r.musteri_adi, musteriAdres: r.musteri_adres ?? undefined,
  kalemler: r.kalemler ?? [],
  araToplam: Number(r.ara_toplam) || 0,
  kdvToplam: Number(r.kdv_toplam) || 0,
  genelToplam: Number(r.genel_toplam) || 0,
  durum: r.durum, notlar: r.notlar ?? undefined,
  olusturan: r.olusturan ?? undefined,
});

router.get("/", async (_req, res: Response) => {
  const db = getPgPool();
  if (!db) { res.json([]); return; }
  const { rows } = await db.query("SELECT * FROM faturalar ORDER BY created_at DESC");
  res.json(rows.map(map));
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const db = getPgPool();
  if (!db) { res.status(503).json({ hata: "Veritabanı bağlantısı yok" }); return; }
  const v = req.body;
  const id = crypto.randomUUID();
  await db.query(
    `INSERT INTO faturalar (id,fatura_no,tip,tarih,musteri_adi,musteri_adres,kalemler,ara_toplam,kdv_toplam,genel_toplam,durum,notlar,olusturan)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [id, v.faturaNo, v.tip, v.tarih, v.musteriAdi, v.musteriAdres||null,
     JSON.stringify(v.kalemler??[]), v.araToplam??0, v.kdvToplam??0, v.genelToplam??0,
     v.durum||"taslak", v.notlar||null, req.kullanici?.kullaniciAdi||null]
  );
  res.json({ id });
});

router.patch("/:id/durum", async (req: AuthRequest, res: Response) => {
  const db = getPgPool();
  if (!db) { res.status(503).json({ hata: "Veritabanı bağlantısı yok" }); return; }
  await db.query("UPDATE faturalar SET durum=$1 WHERE id=$2", [req.body.durum, req.params.id]);
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const db = getPgPool();
  if (!db) { res.status(503).json({ hata: "Veritabanı bağlantısı yok" }); return; }
  await db.query("DELETE FROM faturalar WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
