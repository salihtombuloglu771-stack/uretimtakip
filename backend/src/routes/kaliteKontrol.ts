import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res: Response) => {
  const { data } = await supabase
    .from("kalite_kontrol")
    .select("*")
    .order("created_at", { ascending: false });
  res.json(data ?? []);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("kalite_kontrol").insert({
    id,
    is_emri_no:     v.isEmriNo,
    urun_adi:       v.urunAdi,
    kontrol_tarihi: v.kontrolTarihi,
    kontrol_eden:   v.kontrolEden,
    uygun_adet:     v.uygunAdet    || 0,
    uygunsuz_adet:  v.uygunsuzAdet || 0,
    sonuc:          v.sonuc,
    aciklama:       v.aciklama     || null,
    kayit_yapan:    req.kullanici?.kullaniciAdi || null,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("kalite_kontrol").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

export default router;
