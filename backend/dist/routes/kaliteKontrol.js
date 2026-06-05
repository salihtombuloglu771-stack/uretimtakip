"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (_req, res) => {
    const { data } = await supabase_1.supabase
        .from("kalite_kontrol")
        .select("*")
        .order("created_at", { ascending: false });
    res.json(data ?? []);
});
router.post("/", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("kalite_kontrol").insert({
        id,
        is_emri_no: v.isEmriNo,
        urun_adi: v.urunAdi,
        kontrol_tarihi: v.kontrolTarihi,
        kontrol_eden: v.kontrolEden,
        uygun_adet: v.uygunAdet || 0,
        uygunsuz_adet: v.uygunsuzAdet || 0,
        sonuc: v.sonuc,
        aciklama: v.aciklama || null,
        kayit_yapan: req.kullanici?.kullaniciAdi || null,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.delete("/:id", async (req, res) => {
    await supabase_1.supabase.from("kalite_kontrol").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
exports.default = router;
