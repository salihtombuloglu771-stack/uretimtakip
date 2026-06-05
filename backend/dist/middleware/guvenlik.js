"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginLimiter = exports.genelLimiter = void 0;
exports.inputKontrol = inputKontrol;
exports.hataIsleyici = hataIsleyici;
exports.bilinmeyenRoute = bilinmeyenRoute;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// ── Genel API rate limiter: dakikada 120 istek ────────────────────────────────
exports.genelLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { hata: "Çok fazla istek gönderildi. Lütfen bir dakika bekleyin." },
    skip: (req) => req.path === "/health",
});
// ── Login brute-force koruması: 15 dakikada 3 başarısız deneme ───────────────
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { hata: "Çok fazla başarısız giriş denemesi. 15 dakika bekleyin." },
    skipSuccessfulRequests: true,
});
// ── Input boyut ve tip doğrulama ──────────────────────────────────────────────
function inputKontrol(req, res, next) {
    const MAX = 10000;
    function temizle(deger, derinlik = 0) {
        if (derinlik > 5)
            return null;
        if (typeof deger === "string") {
            if (deger.length > MAX) {
                return deger.slice(0, MAX);
            }
            // Basit XSS temizliği: script taglerini kaldır
            return deger
                .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
                .replace(/javascript\s*:/gi, "")
                .replace(/on\w+\s*=/gi, "");
        }
        if (Array.isArray(deger))
            return deger.slice(0, 500).map(i => temizle(i, derinlik + 1));
        if (deger && typeof deger === "object") {
            const temiz = {};
            for (const [k, v] of Object.entries(deger)) {
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
function hataIsleyici(err, _req, res, _next) {
    console.error("[HATA]", err.message);
    const prod = process.env.NODE_ENV === "production";
    res.status(500).json({
        hata: prod ? "Sunucu hatası oluştu." : err.message,
    });
}
// ── Bilinmeyen route ──────────────────────────────────────────────────────────
function bilinmeyenRoute(_req, res) {
    res.status(404).json({ hata: "Endpoint bulunamadı." });
}
