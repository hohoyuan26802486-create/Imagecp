import React from "react";
import { ArrowRight, Layers, ShieldCheck, Sparkles, Sliders } from "lucide-react";

export const SpecificationBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 my-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>前端預處理架構規範</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            全自動 Canvas 等比例壓縮引擎
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
            最大寬度: 1200px
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-medium">
            壓縮品質: 0.8 (80%)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-medium">
            體積上限: &lt; 1.0 MB
          </span>
        </div>
      </div>

      {/* 4-Step Pipeline Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold mb-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[11px] font-bold">1</span>
            <span>選擇原始大圖</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            支援 4K/8K 巨大照片 (8MB~30MB)，直接在瀏覽器記憶體解碼，不上傳龐大原檔。
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold mb-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[11px] font-bold">2</span>
            <span>Canvas 等比例縮放</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            寬度超過 1200px 時強制等比下採樣，開啟高階插值雙線性平滑濾鏡（Bicubic Smoothing）。
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold mb-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[11px] font-bold">3</span>
            <span>0.8 品質與 &lt; 1MB 檢核</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            以 0.8 Quality 進行 JPEG/WebP 壓縮，若因細節過多超過 1MB 則智慧遞減直到確定小於 1MB。
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold mb-1.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center text-[11px] font-bold">4</span>
            <span>AI 辨識 / 安全上傳</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            將輕量高品質圖檔送往 Gemini 3.7 Flash 進行視覺多模態辨識，或毫秒級上傳後端存檔。
          </p>
        </div>
      </div>
    </div>
  );
};
