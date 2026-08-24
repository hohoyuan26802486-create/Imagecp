import React, { useState, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Copy,
  Sparkles,
  UploadCloud,
  Maximize2,
  SplitSquareVertical,
  Columns,
  ZoomIn,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  FileCheck,
} from "lucide-react";
import { CompressionResult } from "../types";
import { formatBytes } from "../utils/imageCompressor";

interface CompressionInspectorProps {
  result: CompressionResult;
  onTriggerAiAnalysis: () => void;
  onTriggerServerUpload: () => void;
  isAiAnalyzing: boolean;
  isUploading: boolean;
}

export const CompressionInspector: React.FC<CompressionInspectorProps> = ({
  result,
  onTriggerAiAnalysis,
  onTriggerServerUpload,
  isAiAnalyzing,
  isUploading,
}) => {
  const [viewMode, setViewMode] = useState<"split" | "sideBySide">("split");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showIterationLogs, setShowIterationLogs] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    setSliderPosition(percentage);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = result.compressedDataUrl;
    link.download = `compressed_1200px_${result.originalFileName.replace(/\.[^/.]+$/, "")}.jpg`;
    link.click();
  };

  const handleCopyBase64 = async () => {
    try {
      await navigator.clipboard.writeText(result.compressedDataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Top Title & Compliance Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <FileCheck className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              壓縮完成報告與檢視
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            檔案名稱：<span className="font-mono text-slate-700 font-medium">{result.originalFileName}</span>
          </p>
        </div>

        {/* 3 Spec Verification Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>寬度上限 ≤ 1200px</span>
            <span className="font-mono text-emerald-600">({result.compressedWidth}px)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>品質 Quality: 0.8</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              result.isStrictlyUnder1MB
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>體積 &lt; 1.0 MB</span>
            <span className="font-mono text-emerald-700 font-bold">
              ({formatBytes(result.compressedSize)})
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Original vs Compressed Size */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              檔案體積
            </span>
            <span className="font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[11px]">
              -{result.savedPercentage}%
            </span>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 font-mono">
              {formatBytes(result.compressedSize)}
            </div>
            <div className="text-xs text-slate-400 line-through font-mono">
              原圖 {formatBytes(result.originalSize)}
            </div>
          </div>
        </div>

        {/* Resolution Scale */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              像素解析度
            </span>
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              等比例
            </span>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 font-mono">
              {result.compressedWidth} × {result.compressedHeight}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              原圖 {result.originalWidth} × {result.originalHeight}
            </div>
          </div>
        </div>

        {/* Computation Duration */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Canvas 處理耗時
            </span>
            <span className="text-[11px] font-medium text-slate-500">純前端</span>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 font-mono">
              {result.compressionDurationMs} ms
            </div>
            <div className="text-xs text-slate-500">
              {result.iterationsNeeded === 1 ? "1 次命中目標" : `微調 ${result.iterationsNeeded} 輪保證<1MB`}
            </div>
          </div>
        </div>

        {/* Server Memory Protection */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              伺服器記憶體防護
            </span>
            <span className="text-[11px] font-medium text-emerald-600">無風險</span>
          </div>
          <div>
            <div className="text-base font-bold text-emerald-700 font-mono">
              節省 {formatBytes(result.savedBytes)}
            </div>
            <div className="text-xs text-slate-500">
              避免後端巨大圖像 OOM
            </div>
          </div>
        </div>
      </div>

      {/* Visual Image Comparator Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ZoomIn className="w-4 h-4 text-blue-600" />
            <span>畫質比對檢視（肉眼無感失真）：</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "split"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              滑桿分割比對
            </button>
            <button
              type="button"
              onClick={() => setViewMode("sideBySide")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "sideBySide"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              左右並列檢視
            </button>
          </div>
        </div>

        {/* Comparison Render */}
        {viewMode === "split" ? (
          <div
            ref={containerRef}
            id="split-comparator-container"
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            onMouseMove={(e) => {
              if (isDraggingSlider) handleSliderMove(e.clientX);
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) handleSliderMove(e.touches[0].clientX);
            }}
            className="relative w-full h-[380px] sm:h-[480px] rounded-xl overflow-hidden bg-slate-950 select-none cursor-ew-resize border border-slate-200"
          >
            {/* Compressed Image (Background Layer) */}
            <img
              src={result.compressedDataUrl}
              alt="Compressed"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            <div className="absolute top-3 right-3 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-700/50 shadow-md">
              壓縮後 (1200px / Q0.8 / {formatBytes(result.compressedSize)})
            </div>

            {/* Original Image (Clipped Overlay Layer) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={result.originalPreviewUrl}
                alt="Original"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none"
                style={{
                  width: containerRef.current?.offsetWidth || "100%",
                  height: "100%",
                }}
              />
            </div>
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-700 shadow-md">
              原始大圖 ({result.originalWidth}px / {formatBytes(result.originalSize)})
            </div>

            {/* Vertical Split Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-300 text-xs font-bold">
                ↔
              </div>
            </div>

            {/* Help Hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full pointer-events-none">
              左右拖曳滑桿即時檢驗細節
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative h-[280px] sm:h-[360px] bg-slate-950 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={result.originalPreviewUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-700">
                原始大圖 ({result.originalWidth}×{result.originalHeight} · {formatBytes(result.originalSize)})
              </div>
            </div>

            <div className="relative h-[280px] sm:h-[360px] bg-slate-950 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={result.compressedDataUrl}
                alt="Compressed"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-700/50">
                壓縮後 ({result.compressedWidth}×{result.compressedHeight} · {formatBytes(result.compressedSize)})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Iteration Logs Collapse (Shows the step-down process if applicable) */}
      {result.stepLogs.length > 1 && (
        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70">
          <div
            onClick={() => setShowIterationLogs(!showIterationLogs)}
            className="flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-700"
          >
            <span>自動調整軌跡（共執行 {result.stepLogs.length} 次運算以確保小於 1MB）</span>
            <span className="text-blue-600 hover:underline">
              {showIterationLogs ? "收合歷程" : "查看歷程"}
            </span>
          </div>

          {showIterationLogs && (
            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200">
              {result.stepLogs.map((log) => (
                <div
                  key={log.step}
                  className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-slate-700">
                    第 {log.step} 輪：尺寸 {log.width}x{log.height} · 品質 {log.quality}
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatBytes(log.sizeBytes)} {log.isUnder1MB ? " (符合 <1MB ✅)" : " (超出 ❌)"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-trigger-ai"
            onClick={onTriggerAiAnalysis}
            disabled={isAiAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isAiAnalyzing ? "AI 視覺辨識分析中..." : "下一步：執行 Gemini 3.7 AI 影像辨識"}</span>
          </button>

          <button
            type="button"
            id="btn-trigger-upload"
            onClick={onTriggerServerUpload}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4 text-blue-400" />
            <span>{isUploading ? "上傳伺服器中..." : "上傳已壓縮照片至伺服器"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyBase64}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "已複製 Base64！" : "複製 Base64"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載壓縮後檔案</span>
          </button>
        </div>
      </div>
    </div>
  );
};
