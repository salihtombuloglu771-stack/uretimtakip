import { NextRequest, NextResponse } from "next/server";

// iyzico API bilgileri — Vercel'e env var olarak eklenecek
const IYZICO_URL    = process.env.IYZICO_URL    ?? "https://sandbox-api.iyzipay.com";
const API_KEY       = process.env.IYZICO_API_KEY ?? "sandbox-your-api-key";
const SECRET_KEY    = process.env.IYZICO_SECRET  ?? "sandbox-your-secret-key";
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uretimtakip-six.vercel.app";

import crypto from "crypto";

function iyzicoPKIString(params: Record<string, unknown>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

function iyzicoAuth(randomStr: string, pki: string): string {
  const hash = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(API_KEY + randomStr + SECRET_KEY + pki)
    .digest("base64");
  return `IYZWSv2 ${Buffer.from(`apiKey:${API_KEY}&randomKey:${randomStr}&signature:${hash}`).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ad, soyad, email, tel, firma, adres, il, posta,
      paket, tutar,
    } = body;

    const conversationId = crypto.randomUUID();
    const randomStr      = Math.random().toString(36).substring(2);

    const odemeIstegi = {
      locale: "tr",
      conversationId,
      price:            String(tutar / 100),       // kuruş → TL
      paidPrice:        String(tutar / 100),
      currency:         "TRY",
      installment:      "1",
      basketId:         `NEXPLAN-${conversationId.substring(0, 8)}`,
      paymentChannel:   "WEB",
      paymentGroup:     "SUBSCRIPTION",
      callbackUrl:      `${SITE_URL}/api/odeme/callback`,
      buyer: {
        id:             email,
        name:           ad,
        surname:        soyad,
        gsmNumber:      tel.startsWith("+") ? tel : `+90${tel.replace(/^0/, "")}`,
        email,
        identityNumber: "11111111111",    // sandbox için sabit
        registrationAddress: adres,
        city:           il,
        country:        "Turkey",
        zipCode:        posta || "34000",
      },
      shippingAddress: {
        contactName: `${ad} ${soyad}`,
        city:        il,
        country:     "Turkey",
        address:     adres,
      },
      billingAddress: {
        contactName: `${ad} ${soyad}`,
        city:        il,
        country:     "Turkey",
        address:     adres,
      },
      basketItems: [{
        id:        paket,
        name:      `NexPlan ${paket} Paketi`,
        category1: "Yazilim",
        itemType:  "VIRTUAL",
        price:     String(tutar / 100),
      }],
    };

    const pki = iyzicoPKIString(odemeIstegi as unknown as Record<string, unknown>);
    const auth = iyzicoAuth(randomStr, pki);

    const res = await fetch(`${IYZICO_URL}/payment/iyzipos/initialize`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": auth,
        "x-iyzi-rnd":    randomStr,
      },
      body: JSON.stringify(odemeIstegi),
    });

    const data = await res.json();

    if (data.status !== "success") {
      return NextResponse.json({ hata: data.errorMessage ?? "iyzico hatası" }, { status: 400 });
    }

    return NextResponse.json({
      checkoutFormContent: data.checkoutFormContent,
      token:               data.token,
    });

  } catch (err) {
    console.error("Ödeme hatası:", err);
    return NextResponse.json({ hata: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
