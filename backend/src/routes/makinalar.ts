import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res: Response) => {
  const { data } = await supabase
    .from("makinalar")
    .select("*")
    .order("created_at", { ascending: true });
  res.json(data ?? []);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const v = req.body;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("makinalar").insert({
    id,
    makina_no:          v.makinaNo,
    makina_adi:         v.makinaAdi,
    durum:              v.durum              || "aktif",
    son_bakim_tarihi:   v.sonBakimTarihi     || null,
    bakim_periyodu_gun: v.bakimPeriyoduGun   || null,
  });
  if (error) { res.status(400).json({ hata: error.message }); return; }
  res.json({ id });
});

router.patch("/:id/durum", async (req: AuthRequest, res: Response) => {
  await supabase.from("makinalar").update({ durum: req.body.durum }).eq("id", req.params.id);
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  await supabase.from("makinalar").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

export default router;
