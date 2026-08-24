import React, { useState } from "react";
import {
  Layers,
  CheckCircle2,
  Download,
  Trash2,
  Eye,
  Sparkles,
  ArrowRight,
  Loader2,
  FileCheck,
} from "lucide-react";
import { CompressionResult } from "../types";
import { formatBytes } from "../utils/imageCompressor";

interface BatchCompressorProps {
  batchResults: CompressionResult[];
  onSelectResult: (result: CompressionResult) => void;
  onClearBatch: () => void;
}

export const BatchCompressor: React.FC<BatchCompressorProps> = ({
  batchResults,
  onSelectResult,
  onClearBatch,
}) => {
  if (batchResults.length === 0) return null;

  const totalOriginalBytes = batchResults.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressedBytes = batchResults.reduce((acc, curr) => acc + curr.compressedSize, 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const overallSavedPercentage = totalOriginalBytes > 0
    ? ((totalSavedBytes / totalOriginalBytes) * 100).toFixed(1)
    : "0";

  const handleDownloadAll = () => {
    batchResults.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = item.compressedDataUrl;
        link.download = `compressed_1200px_${item.originalFileName.replace(/\.[^/.]+$/, "")}.jpg`;
        link.click();
      }, index * 200);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              批次照片壓縮佇列（共 {batchResults.length} 張）
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            總計節省 {formatBytes(totalSavedBytes)} 頻寬（-{overallSavedPercentage}%），所有照片皆符合 ≤1200px / Q0.8 / &lt;1MB 規範
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            批次全部下載
          </button>

          <button
            type="button"
            onClick={onClearBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空列表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {batchResults.map((item) => (
          <div
            key={item.id}
            className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-2.5"
          >
            <div className="flex items-start gap-2.5">
              <img
                src={item.compressedDataUrl}
                alt={item.originalFileName}
                className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0 border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {item.originalFileName}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                  <span className="line-through">{formatBytes(item.originalSize)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700 font-bold">{formatBytes(item.compressedSize)}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {item.compressedWidth} × {item.compressedHeight} px · Q0.8
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已縮至 &lt;1MB
              </span>
              <button
                type="button"
                onClick={() => onSelectResult(item)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                檢視細節與 AI 辨識
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
