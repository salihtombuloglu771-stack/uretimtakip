"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (_req, res) => {
    const { data } = await supabase_1.supabase
        .from("malzemeler")
        .select("*")
        .order("created_at", { ascending: false });
    res.json(data ?? []);
});
router.post("/", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("malzemeler").insert({
        id,
        malzeme_kodu: v.malzemeKodu,
        malzeme_adi: v.malzemeAdi,
        birim: v.birim,
        stok_miktari: v.stokMiktari || 0,
        birim_fiyat: v.birimFiyat || null,
        fotograf: v.fotograf || null,
        kayit_yapan: req.kullanici?.kullaniciAdi || null,
    });
    if (error) {
        res.status(400).json({ hata: "Bu malzeme kodu zaten kayıtlı" });
        return;
    }
    res.json({ id });
});
router.patch("/:id/fotograf", async (req, res) => {
    await supabase_1.supabase.from("malzemeler").update({ fotograf: req.body.fotograf }).eq("id", req.params.id);
    res.json({ ok: true });
});
router.delete("/:id", async (req, res) => {
    await supabase_1.supabase.from("malzemeler").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
exports.default = router;
