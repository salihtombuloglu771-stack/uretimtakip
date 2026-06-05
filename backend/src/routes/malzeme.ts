import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res: Response) => {
  const { data } = await supabase
    .from("malzemeler")
    .select("*")
    .order("created_at", { ascending: false });
  res.json(data ?? []);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("malzemeler").insert({
    id,
    malzeme_kodu: v.malzemeKodu,
    malzeme_adi:  v.malzemeAdi,
    birim:        v.birim,
    stok_miktari: v.stokMiktari  || 0,
    birim_fiyat:  v.birimFiyat   || null,
    fotograf:     v.fotograf     || null,
    kayit_yapan:  req.kullanici?.kullaniciAdi || null,
  });
  if (error) { res.status(400).json({ hata: "Bu malzeme kodu zaten kayıtlı" }); return; }
  res.json({ id });
});

router.patch("/:id/fotograf", async (req: AuthRequest, res: Response) => {
  await supabase.from("malzemeler").update({ fotograf: req.body.fotograf }).eq("id", req.params.id);
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("malzemeler").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

export default router;
