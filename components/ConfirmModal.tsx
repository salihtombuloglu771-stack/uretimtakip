"use client";

import { AlertTriangle, X } from "lucide-react";

interface Props {
  acik: boolean;
  mesaj: string;
  onOnayla: () => void;
  onIptal: () => void;
  yikici?: boolean;
}

export default function ConfirmModal({ acik, mesaj, onOnayla, onIptal, yikici = true }: Props) {
  if (!acik) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[150] flex items-center justify-center p-4"
      onClick={onIptal}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${yikici ? "bg-red-100" : "bg-amber-100"}`}>
            <AlertTriangle size={20} className={yikici ? "text-red-500" : "text-amber-500"} />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-800 font-semibold text-base">Emin misiniz?</h3>
            <p className="text-slate-500 text-sm mt-1">{mesaj}</p>
          </div>
          <button onClick={onIptal} className="text-slate-300 hover:text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onIptal}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
            İptal
          </button>
          <button onClick={onOnayla}
            className={`flex-1 py-2.5 text-white text-sm font-medium rounded-xl transition-colors ${yikici ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}>
            {yikici ? "Sil" : "Onayla"}
          </button>
        </div>
      </div>
    </div>
  );
}
