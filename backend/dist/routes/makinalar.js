"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (_req, res) => {
    const { data } = await supabase_1.supabase
        .from("makinalar")
        .select("*")
        .order("created_at", { ascending: true });
    res.json(data ?? []);
});
router.post("/", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("makinalar").insert({
        id,
        makina_no: v.makinaNo,
        makina_adi: v.makinaAdi,
        durum: v.durum || "aktif",
        son_bakim_tarihi: v.sonBakimTarihi || null,
        bakim_periyodu_gun: v.bakimPeriyoduGun || null,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.patch("/:id/durum", async (req, res) => {
    await supabase_1.supabase.from("makinalar").update({ durum: req.body.durum }).eq("id", req.params.id);
    res.json({ ok: true });
});
router.delete("/:id", async (req, res) => {
    await supabase_1.supabase.from("makinalar").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
exports.default = router;
