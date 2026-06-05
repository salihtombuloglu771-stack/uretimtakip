import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase";
import { loginLimiter } from "../middleware/guvenlik";

const router = Router();

// POST /api/auth/giris  — 15dk'da 10 başarısız deneme → kilitlenir
router.post("/giris", loginLimiter, async (req: Request, res: Response) => {
  const { kullaniciAdi, sifre } = req.body as { kullaniciAdi: string; sifre: string };
  if (!kullaniciAdi || !sifre) {
    res.status(400).json({ hata: "Kullanıcı adı ve şifre zorunlu" });
    return;
  }

  const { data, error } = await supabase
    .from("kullanicilar")
    .select("rol")
    .eq("kullanici_adi", kullaniciAdi.trim())
    .eq("sifre", sifre)
    .maybeSingle();

  if (error || !data) {
    res.status(401).json({ hata: "Kullanıcı adı veya şifre hatalı" });
    return;
  }

  const rol = data.rol as string;
  const token = jwt.sign(
    { kullaniciAdi: kullaniciAdi.trim(), rol },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );

  res.json({ token, kullaniciAdi: kullaniciAdi.trim(), rol });
});

// POST /api/auth/sifre-degistir
router.post("/sifre-degistir", async (req, res: Response) => {
  const { kullaniciAdi, eskiSifre, yeniSifre } = req.body;
  if (!kullaniciAdi || !eskiSifre || !yeniSifre) {
    res.status(400).json({ hata: "Tüm alanlar zorunlu" }); return;
  }
  if (yeniSifre.length < 4) {
    res.status(400).json({ hata: "Yeni şifre en az 4 karakter olmalı" }); return;
  }
  const { data, error } = await supabase
    .from("kullanicilar").select("id")
    .eq("kullanici_adi", kullaniciAdi).eq("sifre", eskiSifre).maybeSingle();
  if (error || !data) {
    res.status(401).json({ hata: "Mevcut şifre hatalı" }); return;
  }
  await supabase.from("kullanicilar").update({ sifre: yeniSifre }).eq("kullanici_adi", kullaniciAdi);
  res.json({ ok: true });
});

export default router;
