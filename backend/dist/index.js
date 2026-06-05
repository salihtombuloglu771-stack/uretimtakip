"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const pgdb_1 = require("./config/pgdb");
const guvenlik_1 = require("./middleware/guvenlik");
const auth_1 = __importDefault(require("./routes/auth"));
const isEmirleri_1 = __importDefault(require("./routes/isEmirleri"));
const makinalar_1 = __importDefault(require("./routes/makinalar"));
const malzeme_1 = __importDefault(require("./routes/malzeme"));
const kaliteKontrol_1 = __importDefault(require("./routes/kaliteKontrol"));
const fatura_1 = __importDefault(require("./routes/fatura"));
const proje_1 = __importDefault(require("./routes/proje"));
const diger_1 = __importDefault(require("./routes/diger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 4000;
const PROD = process.env.NODE_ENV === "production";
// ── Güvenlik başlıkları (Helmet) ─────────────────────────────────────────────
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: PROD ? {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://*.supabase.co"],
        },
    } : false,
}));
// ── CORS — sadece bilinen origin'ler ─────────────────────────────────────────
const izinliOriginler = [
    process.env.FRONTEND_URL ?? "http://localhost:3000",
    "https://uretimtakip-six.vercel.app",
];
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true); // Postman / server-to-server
        const izinli = izinliOriginler.some(o => typeof o === "string" ? o === origin : o.test(origin));
        if (izinli)
            return cb(null, true);
        cb(new Error(`CORS: ${origin} izin listesinde yok.`));
    },
    credentials: true,
}));
// ── Genel önlemler ────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: "2mb" })); // 10mb → 2mb (fotoğraf için)
app.use(guvenlik_1.genelLimiter); // Rate limiting
app.use(guvenlik_1.inputKontrol); // XSS & boyut temizliği
app.disable("x-powered-by"); // Express parmak izi gizle
// ── Sağlık kontrolü (rate limit'ten muaf) ────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ durum: "çalışıyor", zaman: new Date().toISOString() });
});
// ── Route'lar ────────────────────────────────────────────────────────────────
app.use("/api/auth", auth_1.default);
app.use("/api/is-emirleri", isEmirleri_1.default);
app.use("/api/makinalar", makinalar_1.default);
app.use("/api/malzeme", malzeme_1.default);
app.use("/api/kalite-kontrol", kaliteKontrol_1.default);
app.use("/api/faturalar", fatura_1.default);
app.use("/api/projeler", proje_1.default);
app.use("/api", diger_1.default);
// ── 404 ve hata yakalayıcı ───────────────────────────────────────────────────
app.use(guvenlik_1.bilinmeyenRoute);
app.use(guvenlik_1.hataIsleyici);
// ── Sunucu başlat ────────────────────────────────────────────────────────────
const initPromise = Promise.all([(0, database_1.initDB)(), (0, pgdb_1.migratePg)()]);
if (process.env.VERCEL !== "1") {
    initPromise.then(() => {
        app.listen(PORT, () => {
            console.log(`✅ NexPlan Backend — http://localhost:${PORT}`);
            console.log(`🔒 Güvenlik: Helmet + Rate Limit + CORS + XSS Filtresi aktif`);
        });
    });
}
exports.default = app;
