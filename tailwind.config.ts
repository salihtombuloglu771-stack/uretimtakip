import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind hangi dosyaları tarayacak? (gereksiz CSS üretmemek için)
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Özel renkler — koyu ERP teması için gri tonları
      colors: {
        panel: "#0f1117",    // En koyu arka plan
        surface: "#1a1d27",  // Kart / panel yüzeyi
        border: "#2a2d3e",   // Kenarlık rengi
        accent: "#4f8ef7",   // Vurgu mavi
        success: "#22c55e",  // Yeşil (başarı)
        danger: "#ef4444",   // Kırmızı (hata/fire)
      },
    },
  },
  plugins: [],
};

export default config;
