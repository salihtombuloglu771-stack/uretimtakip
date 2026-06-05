/** @type {import('next').NextConfig} */

const guvenlikBasliklari = [
  // Clickjacking: site iframe içine alınamaz
  { key: "X-Frame-Options",           value: "DENY" },
  // Tarayıcı MIME sniffing'i engelle
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Referrer bilgisini sınırla
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // XSS koruması (eski tarayıcılar)
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  // DNS prefetch kapat (bilgi sızıntısı azalt)
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  // Permissions: kamera/mikrofon sadece kendi siteden
  { key: "Permissions-Policy",        value: "camera=(self), microphone=(), geolocation=()" },
  // HTTPS zorunlu (Vercel zaten HTTPS ama yine de)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // Next.js için gerekli
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://*.vercel.app https://*.trycloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: guvenlikBasliklari,
      },
    ];
  },

  // Üretimde hata ayrıntılarını gizle
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
