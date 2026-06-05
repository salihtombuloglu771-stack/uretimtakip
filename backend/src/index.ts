import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initDB } from "./config/database";
import { migratePg } from "./config/pgdb";
import { genelLimiter, inputKontrol, hataIsleyici, bilinmeyenRoute } from "./middleware/guvenlik";

import authRoutes       from "./routes/auth";
import isEmirleriRoutes from "./routes/isEmirleri";
import makinalarRoutes  from "./routes/makinalar";
import malzemeRoutes    from "./routes/malzeme";
import kaliteRoutes     from "./routes/kaliteKontrol";
import faturaRoutes     from "./routes/fatura";
import projeRoutes      from "./routes/proje";
import digerRoutes      from "./routes/diger";

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 4000;
const PROD = process.env.NODE_ENV === "production";

// ── Güvenlik başlıkları (Helmet) ─────────────────────────────────────────────
app.use(helmet({
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

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                    // Postman / server-to-server
    const izinli = izinliOriginler.some(o =>
      typeof o === "string" ? o === origin : (o as RegExp).test(origin)
    );
    if (izinli) return cb(null, true);
    cb(new Error(`CORS: ${origin} izin listesinde yok.`));
  },
  credentials: true,
}));

// ── Genel önlemler ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));          // 10mb → 2mb (fotoğraf için)
app.use(genelLimiter);                             // Rate limiting
app.use(inputKontrol);                             // XSS & boyut temizliği
app.disable("x-powered-by");                      // Express parmak izi gizle

// ── Sağlık kontrolü (rate limit'ten muaf) ────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ durum: "çalışıyor", zaman: new Date().toISOString() });
});


// ── Route'lar ────────────────────────────────────────────────────────────────
app.use("/api/auth",           authRoutes);
app.use("/api/is-emirleri",    isEmirleriRoutes);
app.use("/api/makinalar",      makinalarRoutes);
app.use("/api/malzeme",        malzemeRoutes);
app.use("/api/kalite-kontrol", kaliteRoutes);
app.use("/api/faturalar",      faturaRoutes);
app.use("/api/projeler",       projeRoutes);
app.use("/api",                digerRoutes);

// ── 404 ve hata yakalayıcı ───────────────────────────────────────────────────
app.use(bilinmeyenRoute);
app.use(hataIsleyici);

// ── Sunucu başlat ────────────────────────────────────────────────────────────
const initPromise = Promise.all([initDB(), migratePg()]);

if (process.env.VERCEL !== "1") {
  initPromise.then(() => {
    app.listen(PORT, () => {
      console.log(`✅ NexPlan Backend — http://localhost:${PORT}`);
      console.log(`🔒 Güvenlik: Helmet + Rate Limit + CORS + XSS Filtresi aktif`);
    });
  });
}

export default app;
