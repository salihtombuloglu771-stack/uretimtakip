"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pgdb_1 = require("../config/pgdb");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProje = (r) => ({
    id: r.id, projeKodu: r.proje_kodu, projeAdi: r.proje_adi,
    musteri: r.musteri ?? undefined, baslangicTarihi: r.baslangic_tarihi ?? undefined,
    bitisTarihi: r.bitis_tarihi ?? undefined, sorumlu: r.sorumlu ?? undefined,
    durum: r.durum, aciklama: r.aciklama ?? undefined,
    butce: r.butce ? Number(r.butce) : undefined,
    olusturan: r.olusturan ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapGorev = (r) => ({
    id: r.id, projeId: r.proje_id, gorevAdi: r.gorev_adi,
    atanan: r.atanan ?? undefined, bitisTarihi: r.bitis_tarihi ?? undefined, durum: r.durum,
});
function db503(res) { res.status(503).json({ hata: "Veritabanı bağlantısı yok" }); }
// ── Projeler ─────────────────────────────────────────────────────────────────
router.get("/", async (_req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        res.json([]);
        return;
    }
    const { rows } = await db.query("SELECT * FROM projeler ORDER BY created_at DESC");
    res.json(rows.map(mapProje));
});
router.post("/", async (req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        db503(res);
        return;
    }
    const v = req.body;
    const id = crypto.randomUUID();
    await db.query(`INSERT INTO projeler (id,proje_kodu,proje_adi,musteri,baslangic_tarihi,bitis_tarihi,sorumlu,durum,aciklama,butce,olusturan)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [id, v.projeKodu, v.projeAdi, v.musteri || null, v.baslangicTarihi || null,
        v.bitisTarihi || null, v.sorumlu || null, v.durum || "planlama",
        v.aciklama || null, v.butce || null, req.kullanici?.kullaniciAdi || null]);
    res.json({ id });
});
router.patch("/:id/durum", async (req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        db503(res);
        return;
    }
    await db.query("UPDATE projeler SET durum=$1 WHERE id=$2", [req.body.durum, req.params.id]);
    res.json({ ok: true });
});
router.delete("/:id", async (req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        db503(res);
        return;
    }
    await db.query("DELETE FROM proje_gorevleri WHERE proje_id=$1", [req.params.id]);
    await db.query("DELETE FROM projeler WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
});
// ── Görevler ─────────────────────────────────────────────────────────────────
router.get("/:projeId/gorevler", async (req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        res.json([]);
        return;
    }
    const { rows } = await db.query("SELECT * FROM proje_gorevleri WHERE proje_id=$1 ORDER BY created_at", [req.params.projeId]);
    res.json(rows.map(mapGorev));
});
router.post("/:projeId/gorevler", async (req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        db503(res);
        return;
    }
    const v = req.body;
    const id = crypto.randomUUID();
    await db.query("INSERT INTO proje_gorevleri (id,proje_id,gorev_adi,atanan,bitis_tarihi,durum) VALUES ($1,$2,$3,$4,$5,$6)", [id, req.params.projeId, v.gorevAdi, v.atanan || null, v.bitisTarihi || null, v.durum || "bekliyor"]);
    res.json({ id });
});
router.patch("/gorevler/:id/durum", async (req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        db503(res);
        return;
    }
    await db.query("UPDATE proje_gorevleri SET durum=$1 WHERE id=$2", [req.body.durum, req.params.id]);
    res.json({ ok: true });
});
router.delete("/gorevler/:id", async (req, res) => {
    const db = (0, pgdb_1.getPgPool)();
    if (!db) {
        db503(res);
        return;
    }
    await db.query("DELETE FROM proje_gorevleri WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
});
exports.default = router;
