"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (_req, res) => {
    const { data } = await supabase_1.supabase
        .from("is_emirleri")
        .select("*")
        .order("created_at", { ascending: false });
    res.json(data ?? []);
});
router.post("/", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("is_emirleri").insert({
        id,
        is_emri_no: v.isEmriNo,
        makina_no: v.makinaNo || null,
        urun_adi: v.urunAdi,
        uretim_adedi: v.uretimAdedi,
        fire_adedi: v.fireAdedi,
        birim_fiyat: v.birimFiyat || 0,
        hedef_adedi: v.hedefAdedi || null,
        vardiya: v.vardiya || null,
        tarih: v.tarih,
        kayit_yapan: req.kullanici?.kullaniciAdi || null,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.delete("/:id", async (req, res) => {
    await supabase_1.supabase.from("is_emirleri").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
exports.default = router;
