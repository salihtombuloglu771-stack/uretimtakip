"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ClipboardList, Wrench, ChevronDown,
  LogOut, BookOpen, FilePlus, PauseCircle,
  Archive, Truck, Package, Layers, Building, Play,
  BarChart2, Users, ShieldCheck, Shield,
} from "lucide-react";
import { getRol, OTURUM_ANAHTARI, ROL_ANAHTARI } from "./AuthGuard";
import type { KullaniciRol } from "@/data/types";

interface SubTab { icon: React.ElementType; label: string; href: string; }
interface TabItem  { icon: React.ElementType; label: string; href: string; sub?: SubTab[]; }

export default function TabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [rol,          setRol]          = useState<KullaniciRol | null>(null);
  const [kullanici,    setKullanici]    = useState("");
  const [saat,         setSaat]         = useState("");
  const [depoDropdown, setDepoDropdown] = useState(false);
  const depoRef    = useRef<HTMLDivElement>(null);
  const depoBtnRef = useRef<HTMLButtonElement>(null);
  const [depoPos,  setDepoPos]  = useState({ top: 0, left: 0 });

  useEffect(() => {
    setRol(getRol());
    setKullanici(localStorage.getItem("uretim_kullanici_adi") ?? "");
    const tick = () =>
      setSaat(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (depoRef.current && !depoRef.current.contains(e.target as Node)) {
        setDepoDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCikis() {
    localStorage.removeItem(OTURUM_ANAHTARI);
    localStorage.removeItem(ROL_ANAHTARI);
    localStorage.removeItem("uretim_kullanici_adi");
    router.replace("/giris");
  }

  const baseTabs: TabItem[] = [
    { icon: LayoutDashboard, label: "Dashboard",       href: "/"                 },
    { icon: FilePlus,        label: "Üretim Emri",     href: "/uretim-emri"      },
    { icon: ClipboardList,   label: "İş Emirleri",     href: "/is-emirleri"      },
    { icon: Play,            label: "Operasyon",       href: "/operasyon-takibi" },
    { icon: ShieldCheck,     label: "Kalite",          href: "/kalite-kontrol"   },
    { icon: BookOpen,        label: "Ürün Kataloğu",   href: "/urun-katalogu"    },
    { icon: PauseCircle,     label: "Duruş Kaydı",     href: "/durus-kaydi"      },
    { icon: Wrench,          label: "Makinalar",        href: "/makinalar"        },
    {
      icon: Archive, label: "Depo", href: "/depo",
      sub: [
        { icon: Truck,   label: "Sevkiyat Depo", href: "/depo/sevkiyat" },
        { icon: Package, label: "Üretim Depo",   href: "/depo/uretim"   },
      ],
    },
    { icon: Layers,   label: "Malzeme",      href: "/malzeme"      },
    { icon: Building, label: "Sabit Kıymet", href: "/sabit-kiymet" },
    { icon: Users,    label: "Personel",     href: "/personel"     },
    { icon: BarChart2, label: "Raporlar",    href: "/raporlar"     },
  ];

  const tabs: TabItem[] =
    rol === "admin"
      ? [...baseTabs, { icon: Shield, label: "Kullanıcılar", href: "/kullanicilar" }]
      : baseTabs;

  function isActive(tab: TabItem) {
    if (tab.sub)      return pathname.startsWith(tab.href);
    if (tab.href === "/") return pathname === "/";
    return pathname.startsWith(tab.href);
  }

  const tarih = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── HEADER ── */}
      <header className="h-12 bg-[#0d1f3c] flex items-center justify-between px-4 shrink-0 z-20 shadow-lg select-none">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="NexPlan" className="w-7 h-7 flex-shrink-0" />
          <div className="leading-none">
            <span className="text-white font-bold text-sm tracking-wide">NexPlan</span>
            <span className="text-blue-400 text-[11px] ml-1.5">ERP Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-slate-500 text-xs hidden md:block">{tarih}</span>
          <span className="text-blue-300 text-sm font-mono tabular-nums">{saat}</span>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-300 text-[11px] font-bold">
                {(kullanici[0] ?? rol?.[0] ?? "?").toUpperCase()}
              </span>
            </div>
            <div className="leading-none hidden md:block">
              <p className="text-white text-xs font-medium capitalize">{kullanici || rol || "Kullanıcı"}</p>
              <p className="text-slate-500 text-[10px]">{rol === "admin" ? "Tam Yetki" : "Operatör"}</p>
            </div>
          </div>

          <button
            onClick={handleCikis}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded hover:bg-red-500/10"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* ── TAB BAR ── */}
      <nav className="bg-[#162d56] shrink-0 z-10 shadow-md flex items-end overflow-x-auto px-2 pt-1.5 gap-px scrollbar-none"
           style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => {
          const Icon   = tab.icon;
          const active = isActive(tab);

          /* Depo — dropdown */
          if (tab.sub) {
            const subActive = pathname.startsWith("/depo");
            return (
              <div key={tab.href} className="relative flex-shrink-0" ref={depoRef}>
                <button
                  ref={depoBtnRef}
                  onClick={() => {
                    if (!depoDropdown && depoBtnRef.current) {
                      const r = depoBtnRef.current.getBoundingClientRect();
                      setDepoPos({ top: r.bottom, left: r.left });
                    }
                    setDepoDropdown((v) => !v);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium rounded-t-md transition-all whitespace-nowrap ${
                    subActive
                      ? "bg-slate-100 text-slate-800 shadow-sm"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                  <ChevronDown
                    size={11}
                    className={`ml-0.5 transition-transform ${depoDropdown ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            );
          }

          /* Normal sekme */
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium rounded-t-md transition-all whitespace-nowrap ${
                active
                  ? "bg-slate-100 text-slate-800 shadow-sm"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* ── DEPO DROPDOWN (nav dışında — overflow kesmez) ── */}
      {depoDropdown && (
        <div
          style={{ position: "fixed", top: depoPos.top, left: depoPos.left, zIndex: 9999 }}
          className="bg-white shadow-2xl rounded-b-lg border border-slate-200 overflow-hidden min-w-[170px]"
        >
          {tabs.find((t) => t.sub)?.sub?.map((sub) => {
            const SubIcon = sub.icon;
            const isSubActive = pathname.startsWith(sub.href);
            return (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={() => setDepoDropdown(false)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-colors ${
                  isSubActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SubIcon size={13} />
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* ── İÇERİK ── */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
