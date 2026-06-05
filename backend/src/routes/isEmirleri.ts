import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res: Response) => {
  const { data } = await supabase
    .from("is_emirleri")
    .select("*")
    .order("created_at", { ascending: false });
  res.json(data ?? []);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("is_emirleri").insert({
    id,
    is_emri_no:   v.isEmriNo,
    makina_no:    v.makinaNo    || null,
    urun_adi:     v.urunAdi,
    uretim_adedi: v.uretimAdedi,
    fire_adedi:   v.fireAdedi,
    birim_fiyat:  v.birimFiyat  || 0,
    hedef_adedi:  v.hedefAdedi  || null,
    vardiya:      v.vardiya     || null,
    tarih:        v.tarih,
    kayit_yapan:  req.kullanici?.kullaniciAdi || null,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("is_emirleri").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

export default router;
