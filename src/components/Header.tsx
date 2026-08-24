import React from "react";
import { ShieldCheck, Cpu, Sparkles, CheckCircle2, Zap } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                前端圖片壓縮與 AI 影像辨識
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                規格遵循 1200px / Q0.8 / &lt;1MB
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Canvas 等比例前端壓縮 · 阻斷伺服器記憶體過載 · 無縫串接 Gemini 3.7 Flash
            </p>
          </div>
        </div>

        {/* Server Protection Status Tag */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="font-medium">伺服器防爆機制：</span>
          <span className="text-emerald-600 font-semibold">運作中 (零後端轉碼負擔)</span>
        </div>
      </div>
    </header>
  );
};
