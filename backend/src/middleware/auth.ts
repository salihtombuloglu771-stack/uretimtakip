import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  kullanici?: { kullaniciAdi: string; rol: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ hata: "Yetkisiz erişim" });
    return;
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      kullaniciAdi: string;
      rol: string;
    };
    req.kullanici = decoded;
    next();
  } catch {
    res.status(401).json({ hata: "Geçersiz veya süresi dolmuş token" });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.kullanici?.rol !== "admin") {
    res.status(403).json({ hata: "Bu işlem için admin yetkisi gerekli" });
    return;
  }
  next();
}
