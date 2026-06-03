// Backend API istemcisi — tüm veri işlemleri buradan yapılır

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

function token(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("uretim_token") ?? "";
}

async function istek<T>(yol: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${yol}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ hata: res.statusText }));
    throw new Error((err as { hata?: string }).hata ?? "Sunucu hatası");
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiGiris = (kullaniciAdi: string, sifre: string) =>
  istek<{ token: string; kullaniciAdi: string; rol: string }>(
    "/api/auth/giris", "POST", { kullaniciAdi, sifre }
  );

// ── Veri dönüşüm yardımcıları (SQLite snake_case → camelCase) ─────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapIE = (r: any) => ({
  id: r.id, isEmriNo: r.is_emri_no, makinaNo: r.makina_no ?? "",
  urunAdi: r.urun_adi, uretimAdedi: r.uretim_adedi, fireAdedi: r.fire_adedi,
  birimFiyat: r.birim_fiyat ?? 0, hedefAdedi: r.hedef_adedi ?? undefined,
  vardiya: r.vardiya ?? undefined, tarih: r.tarih, kayitYapan: r.kayit_yapan ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMakina = (r: any) => ({
  id: r.id, makinaNo: r.makina_no, makinaAdi: r.makina_adi, durum: r.durum,
  sonBakimTarihi: r.son_bakim_tarihi ?? undefined, bakimPeriyoduGun: r.bakim_periyodu_gun ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMalzeme = (r: any) => ({
  id: r.id, malzemeKodu: r.malzeme_kodu, malzemeAdi: r.malzeme_adi,
  birim: r.birim, stokMiktari: r.stok_miktari, birimFiyat: r.birim_fiyat ?? undefined,
  fotograf: r.fotograf ?? undefined, kayitYapan: r.kayit_yapan ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapKalite = (r: any) => ({
  id: r.id, isEmriNo: r.is_emri_no, urunAdi: r.urun_adi,
  kontrolTarihi: r.kontrol_tarihi, kontrolEden: r.kontrol_eden,
  uygunAdet: r.uygun_adet, uygunsuzAdet: r.uygunsuz_adet,
  sonuc: r.sonuc, aciklama: r.aciklama ?? undefined, kayitYapan: r.kayit_yapan ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDepo = (r: any) => ({
  id: r.id, depoTuru: r.depo_turu, urunAdi: r.urun_adi, miktar: r.miktar,
  birim: r.birim, hareketTuru: r.hareket_turu, tarih: r.tarih,
  aciklama: r.aciklama ?? undefined, kayitYapan: r.kayit_yapan ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDurus = (r: any) => ({
  id: r.id, makinaNo: r.makina_no, baslangicTarihi: r.baslangic_tarihi,
  bitisTarihi: r.bitis_tarihi, neden: r.neden, aciklama: r.aciklama ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapOp = (r: any) => ({
  id: r.id, isEmriId: r.is_emri_id, isEmriNo: r.is_emri_no,
  urunAdi: r.urun_adi, makinaNo: r.makina_no ?? undefined,
  baslangic: r.baslangic, bitis: r.bitis ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDemirbas = (r: any) => ({
  id: r.id, demirbasNo: r.demirbas_no, demirbasAdi: r.demirbas_adi,
  konum: r.konum ?? undefined, alisTarihi: r.alis_tarihi ?? undefined,
  alisFiyati: r.alis_fiyati ?? undefined, durum: r.durum,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPersonel = (r: any) => ({
  id: r.id, sicilNo: r.sicil_no, adSoyad: r.ad_soyad,
  departman: r.departman ?? "", pozisyon: r.pozisyon ?? "",
  vardiya: r.vardiya ?? undefined, durum: r.durum, iseGirisTarihi: r.ise_giris_tarihi ?? undefined,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapUrun = (r: any) => ({
  id: r.id, urunKodu: r.urun_kodu, urunAdi: r.urun_adi, birimFiyat: r.birim_fiyat ?? 0,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapKullanici = (r: any) => ({
  id: r.id, kullaniciAdi: r.kullanici_adi, rol: r.rol,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMesaj = (r: any) => ({
  id: r.id, gonderen: r.gonderen, alici: r.alici, icerik: r.icerik,
  tarih: r.tarih, okundu: r.okundu === 1 || r.okundu === true,
});

// ── İş Emirleri ──────────────────────────────────────────────────────────────
export const apiGetIsEmirleri  = () =>
  istek<unknown[]>("/api/is-emirleri").then(d => d.map(mapIE));
export const apiAddIsEmri = (v: unknown) =>
  istek<{ id: string }>("/api/is-emirleri", "POST", v);
export const apiDeleteIsEmri = (id: string) =>
  istek<void>(`/api/is-emirleri/${id}`, "DELETE");

// ── Makinalar ────────────────────────────────────────────────────────────────
export const apiGetMakinalar = () =>
  istek<unknown[]>("/api/makinalar").then(d => d.map(mapMakina));
export const apiAddMakina = (v: unknown) =>
  istek<{ id: string }>("/api/makinalar", "POST", v);
export const apiUpdateMakinaDurum = (id: string, durum: string) =>
  istek<void>(`/api/makinalar/${id}/durum`, "PATCH", { durum });
export const apiDeleteMakina = (id: string) =>
  istek<void>(`/api/makinalar/${id}`, "DELETE");

// ── Malzeme ──────────────────────────────────────────────────────────────────
export const apiGetMalzemeler = () =>
  istek<unknown[]>("/api/malzeme").then(d => d.map(mapMalzeme));
export const apiAddMalzeme = (v: unknown) =>
  istek<{ id: string }>("/api/malzeme", "POST", v);
export const apiUpdateFotograf = (id: string, fotograf: string) =>
  istek<void>(`/api/malzeme/${id}/fotograf`, "PATCH", { fotograf });
export const apiDeleteMalzeme = (id: string) =>
  istek<void>(`/api/malzeme/${id}`, "DELETE");

// ── Kalite Kontrol ───────────────────────────────────────────────────────────
export const apiGetKalite = () =>
  istek<unknown[]>("/api/kalite-kontrol").then(d => d.map(mapKalite));
export const apiAddKalite = (v: unknown) =>
  istek<{ id: string }>("/api/kalite-kontrol", "POST", v);
export const apiDeleteKalite = (id: string) =>
  istek<void>(`/api/kalite-kontrol/${id}`, "DELETE");

// ── Ürünler ──────────────────────────────────────────────────────────────────
export const apiGetUrunler = () =>
  istek<unknown[]>("/api/urunler").then(d => d.map(mapUrun));
export const apiAddUrun = (v: unknown) =>
  istek<{ id: string }>("/api/urunler", "POST", v);
export const apiDeleteUrun = (id: string) =>
  istek<void>(`/api/urunler/${id}`, "DELETE");

// ── Duruş ────────────────────────────────────────────────────────────────────
export const apiGetDurus = () =>
  istek<unknown[]>("/api/durus").then(d => d.map(mapDurus));
export const apiAddDurus = (v: unknown) =>
  istek<{ id: string }>("/api/durus", "POST", v);
export const apiDeleteDurus = (id: string) =>
  istek<void>(`/api/durus/${id}`, "DELETE");

// ── Operasyonlar ─────────────────────────────────────────────────────────────
export const apiGetOperasyonlar = () =>
  istek<unknown[]>("/api/operasyonlar").then(d => d.map(mapOp));
export const apiAddOperasyon = (v: unknown) =>
  istek<{ id: string }>("/api/operasyonlar", "POST", v);
export const apiUpdateOpBitis = (id: string, bitis: string) =>
  istek<void>(`/api/operasyonlar/${id}/bitis`, "PATCH", { bitis });

// ── Depo ─────────────────────────────────────────────────────────────────────
export const apiGetDepo = () =>
  istek<unknown[]>("/api/depo").then(d => d.map(mapDepo));
export const apiAddDepo = (v: unknown) =>
  istek<{ id: string }>("/api/depo", "POST", v);
export const apiDeleteDepo = (id: string) =>
  istek<void>(`/api/depo/${id}`, "DELETE");

// ── Demirbaş ─────────────────────────────────────────────────────────────────
export const apiGetDemirbaslar = () =>
  istek<unknown[]>("/api/demirbaslar").then(d => d.map(mapDemirbas));
export const apiAddDemirbas = (v: unknown) =>
  istek<{ id: string }>("/api/demirbaslar", "POST", v);
export const apiDeleteDemirbas = (id: string) =>
  istek<void>(`/api/demirbaslar/${id}`, "DELETE");

// ── Personel ─────────────────────────────────────────────────────────────────
export const apiGetPersonel = () =>
  istek<unknown[]>("/api/personel").then(d => d.map(mapPersonel));
export const apiAddPersonel = (v: unknown) =>
  istek<{ id: string }>("/api/personel", "POST", v);
export const apiDeletePersonel = (id: string) =>
  istek<void>(`/api/personel/${id}`, "DELETE");

// ── Kullanıcılar ─────────────────────────────────────────────────────────────
export const apiGetKullanicilar = () =>
  istek<unknown[]>("/api/kullanicilar").then(d => d.map(mapKullanici));
export const apiAddKullanici = (v: unknown) =>
  istek<{ id: string }>("/api/kullanicilar", "POST", v);
export const apiDeleteKullanici = (id: string) =>
  istek<void>(`/api/kullanicilar/${id}`, "DELETE");

// ── Mesajlar ─────────────────────────────────────────────────────────────────
export const apiGetMesajlar = () =>
  istek<unknown[]>("/api/mesajlar").then(d => d.map(mapMesaj));
export const apiAddMesaj = (alici: string, icerik: string) =>
  istek<{ id: string }>("/api/mesajlar", "POST", { alici, icerik });
export const apiMarkOkundu = (id: string) =>
  istek<void>(`/api/mesajlar/${id}/okundu`, "PATCH");
export const apiDeleteMesaj = (id: string) =>
  istek<void>(`/api/mesajlar/${id}`, "DELETE");
export const apiOkunmamisSayisi = async (kullaniciAdi: string): Promise<number> => {
  const mesajlar = await apiGetMesajlar();
  return mesajlar.filter(m => m.alici === kullaniciAdi && !m.okundu).length;
};
