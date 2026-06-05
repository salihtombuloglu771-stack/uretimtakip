import { supabase } from "./supabase";

export async function initDB() {
  try {
    const { data } = await supabase
      .from("kullanicilar")
      .select("id")
      .eq("kullanici_adi", "admin")
      .maybeSingle();

    if (!data) {
      await supabase.from("kullanicilar").insert([
        { id: crypto.randomUUID(), kullanici_adi: "admin",    sifre: "1234", rol: "admin" },
        { id: crypto.randomUUID(), kullanici_adi: "operatör", sifre: "1234", rol: "operatör" },
      ]);
      console.log("✅ Varsayılan kullanıcılar oluşturuldu (admin/1234)");
    }
  } catch (e) {
    console.error("⚠️  DB init hatası:", e);
  }
}
