"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// ── Ürünler ──────────────────────────────────────────────────────────────────
router.get("/urunler", async (_req, res) => {
    const { data } = await supabase_1.supabase.from("urunler").select("*").order("created_at", { ascending: true });
    res.json(data ?? []);
});
router.post("/urunler", async (req, res) => {
    const id = crypto.randomUUID();
    const { urunKodu, urunAdi, birimFiyat } = req.body;
    const { error } = await supabase_1.supabase.from("urunler").insert({ id, urun_kodu: urunKodu, urun_adi: urunAdi, birim_fiyat: birimFiyat || 0 });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.delete("/urunler/:id", async (req, res) => {
    await supabase_1.supabase.from("urunler").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
// ── Duruş ────────────────────────────────────────────────────────────────────
router.get("/durus", async (_req, res) => {
    const { data } = await supabase_1.supabase.from("durus_kayitlari").select("*").order("created_at", { ascending: false });
    res.json(data ?? []);
});
router.post("/durus", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("durus_kayitlari").insert({
        id,
        makina_no: v.makinaNo,
        baslangic_tarihi: v.baslangicTarihi,
        bitis_tarihi: v.bitisTarihi,
        neden: v.neden,
        aciklama: v.aciklama || null,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.delete("/durus/:id", async (req, res) => {
    await supabase_1.supabase.from("durus_kayitlari").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
// ── Operasyonlar ─────────────────────────────────────────────────────────────
router.get("/operasyonlar", async (_req, res) => {
    const { data } = await supabase_1.supabase.from("operasyonlar").select("*").order("created_at", { ascending: false });
    res.json(data ?? []);
});
router.post("/operasyonlar", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("operasyonlar").insert({
        id,
        is_emri_id: v.isEmriId,
        is_emri_no: v.isEmriNo,
        urun_adi: v.urunAdi,
        makina_no: v.makinaNo || null,
        baslangic: v.baslangic,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.patch("/operasyonlar/:id/bitis", async (req, res) => {
    await supabase_1.supabase.from("operasyonlar").update({ bitis: req.body.bitis }).eq("id", req.params.id);
    res.json({ ok: true });
});
// ── Depo ─────────────────────────────────────────────────────────────────────
router.get("/depo", async (_req, res) => {
    const { data } = await supabase_1.supabase.from("depo_hareketleri").select("*").order("created_at", { ascending: false });
    res.json(data ?? []);
});
router.post("/depo", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("depo_hareketleri").insert({
        id,
        depo_turu: v.depoTuru,
        urun_adi: v.urunAdi,
        miktar: v.miktar,
        birim: v.birim,
        hareket_turu: v.hareketTuru,
        tarih: v.tarih,
        aciklama: v.aciklama || null,
        kayit_yapan: req.kullanici?.kullaniciAdi || null,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.delete("/depo/:id", async (req, res) => {
    await supabase_1.supabase.from("depo_hareketleri").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
// ── Demirbaş ─────────────────────────────────────────────────────────────────
router.get("/demirbaslar", async (_req, res) => {
    const { data } = await supabase_1.supabase.from("demirbaslar").select("*").order("created_at", { ascending: false });
    res.json(data ?? []);
});
router.post("/demirbaslar", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("demirbaslar").insert({
        id,
        demirbas_no: v.demirbasNo,
        demirbas_adi: v.demirbasAdi,
        konum: v.konum || null,
        alis_tarihi: v.alisTarihi || null,
        alis_fiyati: v.alisFiyati || null,
        durum: v.durum || "aktif",
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.delete("/demirbaslar/:id", async (req, res) => {
    await supabase_1.supabase.from("demirbaslar").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
// ── Personel ─────────────────────────────────────────────────────────────────
router.get("/personel", async (_req, res) => {
    const { data } = await supabase_1.supabase.from("personel").select("*").order("created_at", { ascending: true });
    res.json(data ?? []);
});
router.post("/personel", async (req, res) => {
    const v = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("personel").insert({
        id,
        sicil_no: v.sicilNo,
        ad_soyad: v.adSoyad,
        departman: v.departman || null,
        pozisyon: v.pozisyon || null,
        vardiya: v.vardiya || null,
        durum: v.durum || "aktif",
        ise_giris_tarihi: v.iseGirisTarihi || null,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.delete("/personel/:id", async (req, res) => {
    await supabase_1.supabase.from("personel").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
// ── Kullanıcılar (sadece admin) ──────────────────────────────────────────────
router.get("/kullanicilar", auth_1.adminMiddleware, async (_req, res) => {
    const { data } = await supabase_1.supabase
        .from("kullanicilar")
        .select("id, kullanici_adi, rol")
        .order("created_at", { ascending: true });
    res.json(data ?? []);
});
router.post("/kullanicilar", auth_1.adminMiddleware, async (req, res) => {
    const { kullaniciAdi, sifre, rol } = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("kullanicilar").insert({
        id,
        kullanici_adi: kullaniciAdi,
        sifre,
        rol: rol || "operatör",
    });
    if (error) {
        res.status(400).json({ hata: "Bu kullanıcı adı zaten mevcut" });
        return;
    }
    res.json({ id });
});
router.patch("/kullanicilar/:id/rol", auth_1.adminMiddleware, async (req, res) => {
    const { rol } = req.body;
    if (!rol) {
        res.status(400).json({ hata: "Rol zorunlu" });
        return;
    }
    await supabase_1.supabase.from("kullanicilar").update({ rol }).eq("id", req.params.id);
    res.json({ ok: true });
});
router.delete("/kullanicilar/:id", auth_1.adminMiddleware, async (req, res) => {
    await supabase_1.supabase.from("kullanicilar").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
// ── Mesajlar ─────────────────────────────────────────────────────────────────
router.get("/mesajlar", async (_req, res) => {
    const { data } = await supabase_1.supabase.from("mesajlar").select("*").order("tarih", { ascending: false });
    res.json(data ?? []);
});
router.post("/mesajlar", async (req, res) => {
    const { alici, icerik } = req.body;
    const id = crypto.randomUUID();
    const { error } = await supabase_1.supabase.from("mesajlar").insert({
        id,
        gonderen: req.kullanici?.kullaniciAdi,
        alici,
        icerik,
        tarih: new Date().toISOString(),
        okundu: false,
    });
    if (error) {
        res.status(400).json({ hata: error.message });
        return;
    }
    res.json({ id });
});
router.patch("/mesajlar/:id/okundu", async (req, res) => {
    await supabase_1.supabase.from("mesajlar").update({ okundu: true }).eq("id", req.params.id);
    res.json({ ok: true });
});
router.delete("/mesajlar/:id", async (req, res) => {
    await supabase_1.supabase.from("mesajlar").delete().eq("id", req.params.id);
    res.json({ ok: true });
});
exports.default = router;
