import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

// ── Genel API rate limiter: dakikada 120 istek ────────────────────────────────
export const genelLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { hata: "Çok fazla istek gönderildi. Lütfen bir dakika bekleyin." },
  skip: (req) => req.path === "/health",
});

// ── Login brute-force koruması: 15 dakikada 3 başarısız deneme ───────────────
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { hata: "Çok fazla başarısız giriş denemesi. 15 dakika bekleyin." },
  skipSuccessfulRequests: true,
});

// ── Input boyut ve tip doğrulama ──────────────────────────────────────────────
export function inputKontrol(req: Request, res: Response, next: NextFunction) {
  const MAX = 10_000;

  function temizle(deger: unknown, derinlik = 0): unknown {
    if (derinlik > 5) return null;
    if (typeof deger === "string") {
      if (deger.length > MAX) { return deger.slice(0, MAX); }
      // Basit XSS temizliği: script taglerini kaldır
      return deger
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/javascript\s*:/gi, "")
        .replace(/on\w+\s*=/gi, "");
    }
    if (Array.isArray(deger)) return deger.slice(0, 500).map(i => temizle(i, derinlik + 1));
    if (deger && typeof deger === "object") {
      const temiz: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(deger as Record<string, unknown>)) {
        if (typeof k === "string" && k.length < 100) {
          temiz[k] = temizle(v, derinlik + 1);
        }
      }
      return temiz;
    }
    return deger;
  }

  if (req.body && typeof req.body === "object") {
    req.body = temizle(req.body);
  }
  next();
}

// ── Üretim ortamında hata detaylarını gizle ───────────────────────────────────
export function hataIsleyici(
  err: Error, _req: Request, res: Response, _next: NextFunction
) {
  console.error("[HATA]", err.message);
  const prod = process.env.NODE_ENV === "production";
  res.status(500).json({
    hata: prod ? "Sunucu hatası oluştu." : err.message,
  });
}

// ── Bilinmeyen route ──────────────────────────────────────────────────────────
export function bilinmeyenRoute(_req: Request, res: Response) {
  res.status(404).json({ hata: "Endpoint bulunamadı." });
}
