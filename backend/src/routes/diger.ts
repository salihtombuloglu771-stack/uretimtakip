import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// ── Ürünler ──────────────────────────────────────────────────────────────────
router.get("/urunler", async (_req, res: Response) => {
  const { data } = await supabase.from("urunler").select("*").order("created_at", { ascending: true });
  res.json(data ?? []);
});
router.post("/urunler", async (req: AuthRequest, res: Response) => {
  const id = crypto.randomUUID();
  const { urunKodu, urunAdi, birimFiyat } = req.body;
  const { error } = await supabase.from("urunler").insert({ id, urun_kodu: urunKodu, urun_adi: urunAdi, birim_fiyat: birimFiyat || 0 });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});
router.delete("/urunler/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("urunler").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

// ── Duruş ────────────────────────────────────────────────────────────────────
router.get("/durus", async (_req, res: Response) => {
  const { data } = await supabase.from("durus_kayitlari").select("*").order("created_at", { ascending: false });
  res.json(data ?? []);
});
router.post("/durus", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("durus_kayitlari").insert({
    id,
    makina_no:        v.makinaNo,
    baslangic_tarihi: v.baslangicTarihi,
    bitis_tarihi:     v.bitisTarihi,
    neden:            v.neden,
    aciklama:         v.aciklama || null,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});
router.delete("/durus/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("durus_kayitlari").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

// ── Operasyonlar ─────────────────────────────────────────────────────────────
router.get("/operasyonlar", async (_req, res: Response) => {
  const { data } = await supabase.from("operasyonlar").select("*").order("created_at", { ascending: false });
  res.json(data ?? []);
});
router.post("/operasyonlar", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("operasyonlar").insert({
    id,
    is_emri_id: v.isEmriId,
    is_emri_no: v.isEmriNo,
    urun_adi:   v.urunAdi,
    makina_no:  v.makinaNo  || null,
    baslangic:  v.baslangic,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});
router.patch("/operasyonlar/:id/bitis", async (req: AuthRequest, res: Response) => {
  await supabase.from("operasyonlar").update({ bitis: req.body.bitis }).eq("id", req.params.id);
  res.json({ ok: true });
});

// ── Depo ─────────────────────────────────────────────────────────────────────
router.get("/depo", async (_req, res: Response) => {
  const { data } = await supabase.from("depo_hareketleri").select("*").order("created_at", { ascending: false });
  res.json(data ?? []);
});
router.post("/depo", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("depo_hareketleri").insert({
    id,
    depo_turu:    v.depoTuru,
    urun_adi:     v.urunAdi,
    miktar:       v.miktar,
    birim:        v.birim,
    hareket_turu: v.hareketTuru,
    tarih:        v.tarih,
    aciklama:     v.aciklama || null,
    kayit_yapan:  req.kullanici?.kullaniciAdi || null,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});
router.delete("/depo/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("depo_hareketleri").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

// ── Demirbaş ─────────────────────────────────────────────────────────────────
router.get("/demirbaslar", async (_req, res: Response) => {
  const { data } = await supabase.from("demirbaslar").select("*").order("created_at", { ascending: false });
  res.json(data ?? []);
});
router.post("/demirbaslar", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("demirbaslar").insert({
    id,
    demirbas_no:  v.demirbasNo,
    demirbas_adi: v.demirbasAdi,
    konum:        v.konum       || null,
    alis_tarihi:  v.alisTarihi  || null,
    alis_fiyati:  v.alisFiyati  || null,
    durum:        v.durum       || "aktif",
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});
router.delete("/demirbaslar/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("demirbaslar").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

// ── Personel ─────────────────────────────────────────────────────────────────
router.get("/personel", async (_req, res: Response) => {
  const { data } = await supabase.from("personel").select("*").order("created_at", { ascending: true });
  res.json(data ?? []);
});
router.post("/personel", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("personel").insert({
    id,
    sicil_no:         v.sicilNo,
    ad_soyad:         v.adSoyad,
    departman:        v.departman        || null,
    pozisyon:         v.pozisyon         || null,
    vardiya:          v.vardiya          || null,
    durum:            v.durum            || "aktif",
    ise_giris_tarihi: v.iseGirisTarihi   || null,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});
router.delete("/personel/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("personel").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

// ── Kullanıcılar (sadece admin) ──────────────────────────────────────────────
router.get("/kullanicilar", adminMiddleware, async (_req, res: Response) => {
  const { data } = await supabase
    .from("kullanicilar")
    .select("id, kullanici_adi, rol")
    .order("created_at", { ascending: true });
  res.json(data ?? []);
});
router.post("/kullanicilar", adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { kullaniciAdi, sifre, rol } = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("kullanicilar").insert({
    id,
    kullanici_adi: kullaniciAdi,
    sifre,
    rol: rol || "operatör",
  });
  if (error) { res.status(400).json({ hata: "Bu kullanıcı adı zaten mevcut" }); return; }
  res.json({ id });
});
router.patch("/kullanicilar/:id/rol", adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { rol } = req.body;
  if (!rol) { res.status(400).json({ hata: "Rol zorunlu" }); return; }
  await supabase.from("kullanicilar").update({ rol }).eq("id", req.params.id);
  res.json({ ok: true });
});
router.delete("/kullanicilar/:id", adminMiddleware, async (req: AuthRequest, res: Response) => {
  await supabase.from("kullanicilar").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

// ── Mesajlar ─────────────────────────────────────────────────────────────────
router.get("/mesajlar", async (_req, res: Response) => {
  const { data } = await supabase.from("mesajlar").select("*").order("tarih", { ascending: false });
  res.json(data ?? []);
});
router.post("/mesajlar", async (req: AuthRequest, res: Response) => {
  const { alici, icerik } = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("mesajlar").insert({
    id,
    gonderen: req.kullanici?.kullaniciAdi,
    alici,
    icerik,
    tarih:    new Date().toISOString(),
    okundu:   false,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});
router.patch("/mesajlar/:id/okundu", async (req: AuthRequest, res: Response) => {
  await supabase.from("mesajlar").update({ okundu: true }).eq("id", req.params.id);
  res.json({ ok: true });
});
router.delete("/mesajlar/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("mesajlar").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

export default router;
