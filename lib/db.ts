import { supabase } from "./supabase";
import type {
  IsEmri, YeniIsEmri, Makina, Urun, Durus, Operasyon,
  DepoHareketi, DepoTuru, Malzeme, DemirbasKayit, Personel, KaliteKontrol,
  Kullanici, KullaniciRol,
} from "@/data/types";

// ─── İş Emirleri ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapIE = (r: any): IsEmri => ({
  id: r.id, isEmriNo: r.is_emri_no, makinaNo: r.makina_no ?? "",
  urunAdi: r.urun_adi, uretimAdedi: r.uretim_adedi, fireAdedi: r.fire_adedi,
  birimFiyat: r.birim_fiyat ?? 0, hedefAdedi: r.hedef_adedi ?? undefined,
  vardiya: r.vardiya ?? undefined, tarih: r.tarih,
  kayitYapan: r.kayit_yapan ?? undefined,
});
export const getIsEmirleri = async (): Promise<IsEmri[]> => {
  const { data } = await supabase.from("is_emirleri").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapIE);
};
export const addIsEmri = async (v: YeniIsEmri, kayitYapan?: string): Promise<string> => {
  const id = crypto.randomUUID();
  const base = {
    id, is_emri_no: v.isEmriNo, makina_no: v.makinaNo, urun_adi: v.urunAdi,
    uretim_adedi: v.uretimAdedi, fire_adedi: v.fireAdedi, birim_fiyat: v.birimFiyat,
    hedef_adedi: v.hedefAdedi ?? null, vardiya: v.vardiya ?? null, tarih: v.tarih,
  };
  const { error } = await supabase.from("is_emirleri").insert({ ...base, kayit_yapan: kayitYapan ?? null });
  if (error) await supabase.from("is_emirleri").insert(base);
  return id;
};
export const deleteIsEmri = async (id: string) =>
  supabase.from("is_emirleri").delete().eq("id", id);

// ─── Makinalar ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMakina = (r: any): Makina => ({
  id: r.id, makinaNo: r.makina_no, makinaAdi: r.makina_adi,
  durum: r.durum, sonBakimTarihi: r.son_bakim_tarihi ?? undefined,
  bakimPeriyoduGun: r.bakim_periyodu_gun ?? undefined,
});
export const getMakinalar = async (): Promise<Makina[]> => {
  const { data } = await supabase.from("makinalar").select("*").order("created_at");
  return (data ?? []).map(mapMakina);
};
export const addMakina = async (v: Omit<Makina, "id">): Promise<string> => {
  const id = crypto.randomUUID();
  await supabase.from("makinalar").insert({
    id, makina_no: v.makinaNo, makina_adi: v.makinaAdi, durum: v.durum,
    son_bakim_tarihi: v.sonBakimTarihi ?? null,
    bakim_periyodu_gun: v.bakimPeriyoduGun ?? null,
  });
  return id;
};
export const updateMakinaDurum = async (id: string, durum: "aktif" | "pasif") =>
  supabase.from("makinalar").update({ durum }).eq("id", id);
export const deleteMakina = async (id: string) =>
  supabase.from("makinalar").delete().eq("id", id);

// ─── Ürünler ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapUrun = (r: any): Urun => ({
  id: r.id, urunKodu: r.urun_kodu, urunAdi: r.urun_adi, birimFiyat: r.birim_fiyat ?? 0,
});
export const getUrunler = async (): Promise<Urun[]> => {
  const { data } = await supabase.from("urunler").select("*").order("created_at");
  return (data ?? []).map(mapUrun);
};
export const addUrun = async (v: Omit<Urun, "id">): Promise<string> => {
  const id = crypto.randomUUID();
  await supabase.from("urunler").insert({ id, urun_kodu: v.urunKodu, urun_adi: v.urunAdi, birim_fiyat: v.birimFiyat });
  return id;
};
export const deleteUrun = async (id: string) =>
  supabase.from("urunler").delete().eq("id", id);

// ─── Duruş Kayıtları ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDurus = (r: any): Durus => ({
  id: r.id, makinaNo: r.makina_no, baslangicTarihi: r.baslangic_tarihi,
  bitisTarihi: r.bitis_tarihi, neden: r.neden, aciklama: r.aciklama ?? "",
});
export const getDuruslar = async (): Promise<Durus[]> => {
  const { data } = await supabase.from("durus_kayitlari").select("*").order("created_at");
  return (data ?? []).map(mapDurus);
};
export const addDurus = async (v: Omit<Durus, "id">): Promise<string> => {
  const id = crypto.randomUUID();
  await supabase.from("durus_kayitlari").insert({
    id, makina_no: v.makinaNo, baslangic_tarihi: v.baslangicTarihi,
    bitis_tarihi: v.bitisTarihi, neden: v.neden, aciklama: v.aciklama,
  });
  return id;
};
export const deleteDurus = async (id: string) =>
  supabase.from("durus_kayitlari").delete().eq("id", id);

// ─── Operasyonlar ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapOp = (r: any): Operasyon => ({
  id: r.id, isEmriId: r.is_emri_id, isEmriNo: r.is_emri_no,
  urunAdi: r.urun_adi, makinaNo: r.makina_no ?? undefined,
  baslangic: r.baslangic, bitis: r.bitis ?? undefined,
});
export const getOperasyonlar = async (): Promise<Operasyon[]> => {
  const { data } = await supabase.from("operasyonlar").select("*").order("created_at");
  return (data ?? []).map(mapOp);
};
export const addOperasyon = async (v: Omit<Operasyon, "id">): Promise<string> => {
  const id = crypto.randomUUID();
  await supabase.from("operasyonlar").insert({
    id, is_emri_id: v.isEmriId, is_emri_no: v.isEmriNo, urun_adi: v.urunAdi,
    makina_no: v.makinaNo ?? null, baslangic: v.baslangic, bitis: v.bitis ?? null,
  });
  return id;
};
export const updateOperasyonBitis = async (id: string, bitis: string) =>
  supabase.from("operasyonlar").update({ bitis }).eq("id", id);

// ─── Depo Hareketleri ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDepo = (r: any): DepoHareketi => ({
  id: r.id, depoTuru: r.depo_turu as DepoTuru, urunAdi: r.urun_adi,
  miktar: r.miktar, birim: r.birim, hareketTuru: r.hareket_turu,
  tarih: r.tarih, aciklama: r.aciklama ?? undefined,
});
export const getDepoHareketleri = async (): Promise<DepoHareketi[]> => {
  const { data } = await supabase.from("depo_hareketleri").select("*").order("created_at");
  return (data ?? []).map(mapDepo);
};
export const addDepoHareketi = async (v: Omit<DepoHareketi, "id">): Promise<string> => {
  const id = crypto.randomUUID();
  await supabase.from("depo_hareketleri").insert({
    id, depo_turu: v.depoTuru, urun_adi: v.urunAdi, miktar: v.miktar,
    birim: v.birim, hareket_turu: v.hareketTuru, tarih: v.tarih, aciklama: v.aciklama ?? null,
  });
  return id;
};
export const deleteDepoHareketi = async (id: string) =>
  supabase.from("depo_hareketleri").delete().eq("id", id);

// ─── Malzeme ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMalzeme = (r: any): Malzeme => ({
  id: r.id, malzemeKodu: r.malzeme_kodu, malzemeAdi: r.malzeme_adi,
  birim: r.birim, stokMiktari: r.stok_miktari, birimFiyat: r.birim_fiyat ?? undefined,
  fotograf: r.fotograf ?? undefined, kayitYapan: r.kayit_yapan ?? undefined,
});
export const getMalzemeler = async (): Promise<Malzeme[]> => {
  const { data } = await supabase.from("malzemeler").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapMalzeme);
};
export const addMalzeme = async (v: Omit<Malzeme, "id">, kayitYapan?: string): Promise<string> => {
  const id = crypto.randomUUID();
  const base = {
    id, malzeme_kodu: v.malzemeKodu, malzeme_adi: v.malzemeAdi,
    birim: v.birim, stok_miktari: v.stokMiktari, birim_fiyat: v.birimFiyat ?? null,
    fotograf: v.fotograf ?? null,
  };
  const { error } = await supabase.from("malzemeler").insert({ ...base, kayit_yapan: kayitYapan ?? null });
  if (error) await supabase.from("malzemeler").insert(base);
  return id;
};
export const updateMalzemeFotograf = async (id: string, fotograf: string) =>
  supabase.from("malzemeler").update({ fotograf }).eq("id", id);
export const deleteMalzeme = async (id: string) =>
  supabase.from("malzemeler").delete().eq("id", id);

// ─── Demirbaş ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDemirbas = (r: any): DemirbasKayit => ({
  id: r.id, demirbasNo: r.demirbas_no, demirbasAdi: r.demirbas_adi,
  konum: r.konum ?? undefined, alisTarihi: r.alis_tarihi ?? undefined,
  alisFiyati: r.alis_fiyati ?? undefined, durum: r.durum,
});
export const getDemirbaslar = async (): Promise<DemirbasKayit[]> => {
  const { data } = await supabase.from("demirbaslar").select("*").order("created_at");
  return (data ?? []).map(mapDemirbas);
};
export const addDemirbas = async (v: Omit<DemirbasKayit, "id">): Promise<string> => {
  const id = crypto.randomUUID();
  await supabase.from("demirbaslar").insert({
    id, demirbas_no: v.demirbasNo, demirbas_adi: v.demirbasAdi,
    konum: v.konum ?? null, alis_tarihi: v.alisTarihi ?? null,
    alis_fiyati: v.alisFiyati ?? null, durum: v.durum,
  });
  return id;
};
export const deleteDemirbas = async (id: string) =>
  supabase.from("demirbaslar").delete().eq("id", id);

// ─── Personel ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPersonel = (r: any): Personel => ({
  id: r.id, sicilNo: r.sicil_no, adSoyad: r.ad_soyad,
  departman: r.departman ?? "", pozisyon: r.pozisyon ?? "",
  vardiya: r.vardiya ?? undefined, durum: r.durum,
  iseGirisTarihi: r.ise_giris_tarihi ?? undefined,
});
export const getPersonel = async (): Promise<Personel[]> => {
  const { data } = await supabase.from("personel").select("*").order("created_at");
  return (data ?? []).map(mapPersonel);
};
export const addPersonel = async (v: Omit<Personel, "id">): Promise<string> => {
  const id = crypto.randomUUID();
  await supabase.from("personel").insert({
    id, sicil_no: v.sicilNo, ad_soyad: v.adSoyad, departman: v.departman,
    pozisyon: v.pozisyon, vardiya: v.vardiya ?? null,
    durum: v.durum, ise_giris_tarihi: v.iseGirisTarihi ?? null,
  });
  return id;
};
export const deletePersonel = async (id: string) =>
  supabase.from("personel").delete().eq("id", id);

// ─── Kalite Kontrol ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapKalite = (r: any): KaliteKontrol => ({
  id: r.id, isEmriNo: r.is_emri_no, urunAdi: r.urun_adi,
  kontrolTarihi: r.kontrol_tarihi, kontrolEden: r.kontrol_eden,
  uygunAdet: r.uygun_adet, uygunsuzAdet: r.uygunsuz_adet,
  sonuc: r.sonuc, aciklama: r.aciklama ?? undefined,
  kayitYapan: r.kayit_yapan ?? undefined,
});
export const getKaliteKontroller = async (): Promise<KaliteKontrol[]> => {
  const { data } = await supabase.from("kalite_kontrol").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapKalite);
};
export const addKaliteKontrol = async (v: Omit<KaliteKontrol, "id">, kayitYapan?: string): Promise<string> => {
  const id = crypto.randomUUID();
  const base = {
    id, is_emri_no: v.isEmriNo, urun_adi: v.urunAdi, kontrol_tarihi: v.kontrolTarihi,
    kontrol_eden: v.kontrolEden, uygun_adet: v.uygunAdet, uygunsuz_adet: v.uygunsuzAdet,
    sonuc: v.sonuc, aciklama: v.aciklama ?? null,
  };
  const { error } = await supabase.from("kalite_kontrol").insert({ ...base, kayit_yapan: kayitYapan ?? null });
  if (error) await supabase.from("kalite_kontrol").insert(base);
  return id;
};
export const deleteKaliteKontrol = async (id: string) =>
  supabase.from("kalite_kontrol").delete().eq("id", id);

// ─── Kullanıcı Yönetimi ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapKullanici = (r: any): Kullanici => ({
  id: r.id, kullaniciAdi: r.kullanici_adi, rol: r.rol as KullaniciRol,
});

export const loginKullanici = async (
  kullaniciAdi: string, sifre: string
): Promise<{ rol: KullaniciRol } | null> => {
  const { data } = await supabase
    .from("kullanicilar")
    .select("rol")
    .eq("kullanici_adi", kullaniciAdi)
    .eq("sifre", sifre)
    .single();
  return data ? { rol: data.rol as KullaniciRol } : null;
};

export const getKullanicilar = async (): Promise<Kullanici[]> => {
  const { data } = await supabase
    .from("kullanicilar")
    .select("id, kullanici_adi, rol")
    .order("created_at");
  return (data ?? []).map(mapKullanici);
};

export const addKullanici = async (
  kullaniciAdi: string, sifre: string, rol: KullaniciRol
): Promise<string> => {
  const id = crypto.randomUUID();
  const { error } = await supabase.from("kullanicilar").insert({ id, kullanici_adi: kullaniciAdi, sifre, rol });
  if (error) throw new Error(error.message);
  return id;
};

export const deleteKullanici = async (id: string) =>
  supabase.from("kullanicilar").delete().eq("id", id);
