import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const IYZICO_URL  = process.env.IYZICO_URL    ?? "https://sandbox-api.iyzipay.com";
const API_KEY     = process.env.IYZICO_API_KEY ?? "sandbox-your-api-key";
const SECRET_KEY  = process.env.IYZICO_SECRET  ?? "sandbox-your-secret-key";
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uretimtakip-six.vercel.app";

function iyzicoAuth(randomStr: string, pki: string): string {
  const hash = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(API_KEY + randomStr + SECRET_KEY + pki)
    .digest("base64");
  return `IYZWSv2 ${Buffer.from(`apiKey:${API_KEY}&randomKey:${randomStr}&signature:${hash}`).toString("base64")}`;
}

// iyzico bu endpoint'e POST yapar ve form-urlencoded data gönderir
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = formData.get("token") as string | null;

    if (!token) {
      return yanit("basarisiz", "Ödeme token alınamadı.");
    }

    // Token ile ödeme sonucunu sorgula
    const randomStr = Math.random().toString(36).substring(2);
    const payload   = { locale: "tr", conversationId: crypto.randomUUID(), token };
    const pki       = Object.entries(payload).map(([k, v]) => `${k}=${v}`).join("&");
    const auth      = iyzicoAuth(randomStr, pki);

    const res = await fetch(`${IYZICO_URL}/payment/iyzipos/detail`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": auth,
        "x-iyzi-rnd":    randomStr,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success" && data.paymentStatus === "SUCCESS") {
      return yanit("basarili", "Ödeme başarıyla tamamlandı! Hesabınız aktifleştirilecek.");
    }

    const mesaj = data.errorMessage ?? data.paymentStatus ?? "Ödeme onaylanamadı.";
    return yanit("basarisiz", mesaj);
  } catch (err) {
    console.error("iyzico callback hatası:", err);
    return yanit("basarisiz", "Ödeme doğrulanırken bir hata oluştu.");
  }
}

function yanit(durum: "basarili" | "basarisiz", mesaj: string): NextResponse {
  const renk     = durum === "basarili" ? "#16a34a" : "#dc2626";
  const ikon     = durum === "basarili" ? "✅" : "❌";
  const yonlendir = durum === "basarili" ? `${SITE_URL}/giris` : `${SITE_URL}/odeme`;

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ödeme Sonucu — NexPlan</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f8fafc;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; }
    .kart { background: white; border-radius: 16px; padding: 48px 40px;
            text-align: center; max-width: 420px; width: 90%;
            box-shadow: 0 4px 32px rgba(0,0,0,.08); }
    .ikon { font-size: 56px; margin-bottom: 20px; }
    h1 { color: ${renk}; font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    p  { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
    a  { display: inline-block; background: ${renk}; color: white;
         text-decoration: none; padding: 12px 28px; border-radius: 10px;
         font-weight: 600; font-size: 15px; }
  </style>
  <script>
    setTimeout(function() { window.location.href = "${yonlendir}"; }, 5000);
  </script>
</head>
<body>
  <div class="kart">
    <div class="ikon">${ikon}</div>
    <h1>${durum === "basarili" ? "Ödeme Başarılı!" : "Ödeme Başarısız"}</h1>
    <p>${mesaj}</p>
    <a href="${yonlendir}">${durum === "basarili" ? "Giriş Yap" : "Tekrar Dene"}</a>
    <p style="font-size:12px;margin-top:16px;color:#94a3b8">5 saniye içinde yönlendiriliyorsunuz...</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
