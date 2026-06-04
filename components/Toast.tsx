"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastTip = "basari" | "hata" | "uyari" | "bilgi";

interface ToastItem {
  id: string;
  mesaj: string;
  tip: ToastTip;
}

interface ToastContextType {
  toast: (mesaj: string, tip?: ToastTip) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const IKONLAR: Record<ToastTip, ReactNode> = {
  basari: <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />,
  hata:   <XCircle     size={16} className="text-red-500 flex-shrink-0" />,
  uyari:  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />,
  bilgi:  <Info         size={16} className="text-blue-500 flex-shrink-0" />,
};

const STILLER: Record<ToastTip, string> = {
  basari: "bg-white border-emerald-200 shadow-emerald-100",
  hata:   "bg-white border-red-200   shadow-red-100",
  uyari:  "bg-white border-amber-200  shadow-amber-100",
  bilgi:  "bg-white border-blue-200   shadow-blue-100",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastlar, setToastlar] = useState<ToastItem[]>([]);

  const toast = useCallback((mesaj: string, tip: ToastTip = "basari") => {
    const id = Math.random().toString(36).slice(2);
    setToastlar(p => [...p, { id, mesaj, tip }]);
    setTimeout(() => setToastlar(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  function kapat(id: string) {
    setToastlar(p => p.filter(t => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
        {toastlar.map(t => (
          <div key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm text-slate-700 pointer-events-auto max-w-sm animate-slide-up ${STILLER[t.tip]}`}>
            {IKONLAR[t.tip]}
            <span className="flex-1">{t.mesaj}</span>
            <button onClick={() => kapat(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors ml-1">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
