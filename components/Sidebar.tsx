"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Wrench, ChevronRight, ChevronDown,
  LogOut, BookOpen, FilePlus, PauseCircle,
  Archive, Truck, Package, Layers, Building, Play,
  BarChart2, Users, ShieldCheck, Shield,
} from "lucide-react";
import { getRol, OTURUM_ANAHTARI, ROL_ANAHTARI } from "./AuthGuard";
import { useEffect, useState } from "react";
import type { KullaniciRol } from "@/data/types";

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [rol,      setRol]      = useState<KullaniciRol | null>(null);
  const [depoAcik, setDepoAcik] = useState(false);

  useEffect(() => {
    setRol(getRol());
    if (pathname.startsWith("/depo")) setDepoAcik(true);
  }, [pathname]);

  function handleCikis() {
    localStorage.removeItem(OTURUM_ANAHTARI);
    localStorage.removeItem(ROL_ANAHTARI);
    localStorage.removeItem("uretim_kullanici_adi");
    router.replace("/giris");
  }

  function linkClass(href: string) {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
      isActive
        ? "bg-blue-500/20 text-blue-400"
        : "text-slate-400 hover:bg-slate-700 hover:text-white"
    }`;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard",         href: "/"                 },
    { icon: BarChart2,       label: "Raporlar",           href: "/raporlar"         },
    { icon: FilePlus,        label: "Üretim Emri Gir",   href: "/uretim-emri"      },
    { icon: ClipboardList,   label: "İş Emirleri",       href: "/is-emirleri"      },
    { icon: Play,            label: "Operasyon Takibi",  href: "/operasyon-takibi" },
    { icon: ShieldCheck,     label: "Kalite Kontrol",    href: "/kalite-kontrol"   },
    { icon: BookOpen,        label: "Ürün Kataloğu",     href: "/urun-katalogu"    },
    { icon: PauseCircle,     label: "Duruş Kaydı",       href: "/durus-kaydi"      },
    { icon: Wrench,          label: "Makinalar",          href: "/makinalar"        },
    { icon: Users,           label: "Personel",           href: "/personel"         },
  ];

  const depoAktif = pathname.startsWith("/depo");

  return (
    <aside className="h-screen w-60 bg-slate-800 flex flex-col fixed left-0 top-0 z-10">

      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <img src="/logo.svg" alt="NexPlan" className="w-8 h-8 flex-shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm leading-none">NexPlan</p>
          <p className="text-slate-400 text-xs mt-0.5">ERP Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <Icon size={16} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}

        {/* ── Depo (genişletilebilir bölüm) ── */}
        <div>
          <button
            onClick={() => setDepoAcik((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
              depoAktif
                ? "bg-blue-500/20 text-blue-400"
                : "text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <Archive size={16} />
            <span className="flex-1 text-left">Depo</span>
            {depoAcik ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {depoAcik && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700 pl-3">
              <Link href="/depo/sevkiyat" className={linkClass("/depo/sevkiyat")}>
                <Truck size={14} />
                <span className="flex-1">Sevkiyat Depo</span>
              </Link>
              <Link href="/depo/uretim" className={linkClass("/depo/uretim")}>
                <Package size={14} />
                <span className="flex-1">Üretim Depo</span>
              </Link>
            </div>
          )}
        </div>

        {/* ── Malzeme ── */}
        <Link href="/malzeme" className={linkClass("/malzeme")}>
          <Layers size={16} />
          <span className="flex-1">Malzeme</span>
          {pathname.startsWith("/malzeme") && <ChevronRight size={14} />}
        </Link>

        {/* ── Sabit Kıymet ── */}
        <Link href="/sabit-kiymet" className={linkClass("/sabit-kiymet")}>
          <Building size={16} />
          <span className="flex-1">Sabit Kıymet</span>
          {pathname.startsWith("/sabit-kiymet") && <ChevronRight size={14} />}
        </Link>

        {/* ── Kullanıcılar — sadece admin ── */}
        {rol === "admin" && (
          <>
            <div className="my-1 border-t border-slate-700/60" />
            <Link href="/kullanicilar" className={linkClass("/kullanicilar")}>
              <Shield size={16} />
              <span className="flex-1">Kullanıcılar</span>
              {pathname.startsWith("/kullanicilar") && <ChevronRight size={14} />}
            </Link>
          </>
        )}

      </nav>

      <div className="px-3 py-4 border-t border-slate-700 space-y-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 text-xs font-bold">
              {rol === "admin" ? "A" : "O"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium capitalize">{rol ?? "—"}</p>
            <p className="text-slate-400 text-xs">
              {rol === "admin" ? "Tam Yetki" : "Operatör"}
            </p>
          </div>
        </div>
        <button
          onClick={handleCikis}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
