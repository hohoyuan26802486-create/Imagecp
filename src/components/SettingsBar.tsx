import React from "react";
import { Sliders, RotateCcw, ShieldCheck, Check } from "lucide-react";
import { CompressionConfig } from "../types";
import { DEFAULT_COMPRESSION_CONFIG } from "../utils/imageCompressor";

interface SettingsBarProps {
  config: CompressionConfig;
  onChange: (newConfig: CompressionConfig) => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({ config, onChange }) => {
  const isDefault =
    config.maxWidth === 1200 &&
    config.quality === 0.8 &&
    config.maxSizeBytes === 1024 * 1024;

  const handleReset = () => {
    onChange(DEFAULT_COMPRESSION_CONFIG);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-800">
            壓縮核心規格參數
          </h4>
          {isDefault ? (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              完全符合要求規範（1200px / 0.8 / &lt;1MB）
            </span>
          ) : (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              自訂實驗模式中
            </span>
          )}
        </div>

        {!isDefault && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            重設為標準規範
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
        {/* Max Width */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>最大寬度限制 (Max Width)</span>
            <span className="font-mono font-bold text-blue-600">{config.maxWidth} px</span>
          </div>
          <input
            type="range"
            min={400}
            max={2400}
            step={100}
            value={config.maxWidth}
            onChange={(e) => onChange({ ...config, maxWidth: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-[10px] text-slate-400">規範要求：1200px（超過即等比縮放）</p>
        </div>

        {/* Quality */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>壓縮品質 (Quality)</span>
            <span className="font-mono font-bold text-blue-600">{config.quality} ({Math.round(config.quality * 100)}%)</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1.0}
            step={0.05}
            value={config.quality}
            onChange={(e) => onChange({ ...config, quality: parseFloat(Number(e.target.value).toFixed(2)) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-[10px] text-slate-400">規範要求：0.8（肉眼無感失真最佳平衡點）</p>
        </div>

        {/* File Size Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>目標上限體積</span>
            <span className="font-mono font-bold text-emerald-600">&lt; 1.0 MB (強制)</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoIterateUnder1MB}
                onChange={(e) => onChange({ ...config, autoIterateUnder1MB: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
              <span className="font-medium text-slate-700">自動微調保證 &lt; 1MB</span>
            </label>
          </div>
          <p className="text-[10px] text-slate-400">若初次大於 1MB 則智慧下修確保防當機</p>
        </div>
      </div>
    </div>
  );
};
