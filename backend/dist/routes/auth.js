"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../config/supabase");
const guvenlik_1 = require("../middleware/guvenlik");
const router = (0, express_1.Router)();
// POST /api/auth/giris  — 15dk'da 10 başarısız deneme → kilitlenir
router.post("/giris", guvenlik_1.loginLimiter, async (req, res) => {
    const { kullaniciAdi, sifre } = req.body;
    if (!kullaniciAdi || !sifre) {
        res.status(400).json({ hata: "Kullanıcı adı ve şifre zorunlu" });
        return;
    }
    const { data, error } = await supabase_1.supabase
        .from("kullanicilar")
        .select("rol")
        .eq("kullanici_adi", kullaniciAdi.trim())
        .eq("sifre", sifre)
        .maybeSingle();
    if (error || !data) {
        res.status(401).json({ hata: "Kullanıcı adı veya şifre hatalı" });
        return;
    }
    const rol = data.rol;
    const token = jsonwebtoken_1.default.sign({ kullaniciAdi: kullaniciAdi.trim(), rol }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, kullaniciAdi: kullaniciAdi.trim(), rol });
});
// POST /api/auth/sifre-degistir
router.post("/sifre-degistir", async (req, res) => {
    const { kullaniciAdi, eskiSifre, yeniSifre } = req.body;
    if (!kullaniciAdi || !eskiSifre || !yeniSifre) {
        res.status(400).json({ hata: "Tüm alanlar zorunlu" });
        return;
    }
    if (yeniSifre.length < 4) {
        res.status(400).json({ hata: "Yeni şifre en az 4 karakter olmalı" });
        return;
    }
    const { data, error } = await supabase_1.supabase
        .from("kullanicilar").select("id")
        .eq("kullanici_adi", kullaniciAdi).eq("sifre", eskiSifre).maybeSingle();
    if (error || !data) {
        res.status(401).json({ hata: "Mevcut şifre hatalı" });
        return;
    }
    await supabase_1.supabase.from("kullanicilar").update({ sifre: yeniSifre }).eq("kullanici_adi", kullaniciAdi);
    res.json({ ok: true });
});
exports.default = router;
