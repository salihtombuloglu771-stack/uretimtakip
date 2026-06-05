"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ hata: "Yetkisiz erişim" });
        return;
    }
    const token = header.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.kullanici = decoded;
        next();
    }
    catch {
        res.status(401).json({ hata: "Geçersiz veya süresi dolmuş token" });
    }
}
function adminMiddleware(req, res, next) {
    if (req.kullanici?.rol !== "admin") {
        res.status(403).json({ hata: "Bu işlem için admin yetkisi gerekli" });
        return;
    }
    next();
}
