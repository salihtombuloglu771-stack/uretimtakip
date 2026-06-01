"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Wrench, ChevronRight,
  Factory, LogOut, BookOpen, FilePlus, PauseCircle,
} from "lucide-react";
import { getRol, OTURUM_ANAHTARI, ROL_ANAHTARI } from "./AuthGuard";
import { useEffect, useState } from "react";
import type { KullaniciRol } from "@/data/types";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/"               },
  { icon: FilePlus,        label: "Üretim Emri Gir", href: "/uretim-emri"    },
  { icon: ClipboardList,   label: "İş Emirleri",     href: "/is-emirleri"    },
  { icon: BookOpen,        label: "Ürün Kataloğu",   href: "/urun-katalogu"  },
  { icon: PauseCircle,     label: "Duruş Kaydı",     href: "/durus-kaydi"    },
  { icon: Wrench,          label: "Makinalar",        href: "/makinalar"      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [rol, setRol] = useState<KullaniciRol | null>(null);

  useEffect(() => {
    setRol(getRol());
  }, []);

  function handleCikis() {
    localStorage.removeItem(OTURUM_ANAHTARI);
    localStorage.removeItem(ROL_ANAHTARI);
    router.replace("/giris");
  }

  return (
    <aside className="h-screen w-60 bg-slate-800 flex flex-col fixed left-0 top-0 z-10">

      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Factory size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">ÜretimTakip</p>
          <p className="text-slate-400 text-xs mt-0.5">ERP Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                ${isActive
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
                }
              `}
            >
              <Icon size={16} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
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
