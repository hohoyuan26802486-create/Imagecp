import React from "react";
import {
  UploadCloud,
  CheckCircle2,
  Server,
  ShieldCheck,
  Zap,
  Activity,
  Check,
  HardDrive,
  Cpu,
} from "lucide-react";
import { CompressionResult, UploadServerResponse } from "../types";
import { formatBytes } from "../utils/imageCompressor";

interface ServerUploadSimulatorProps {
  compressedImage: CompressionResult;
  uploadResponse: UploadServerResponse | null;
  isUploading: boolean;
  onUpload: () => void;
}

export const ServerUploadSimulator: React.FC<ServerUploadSimulatorProps> = ({
  compressedImage,
  uploadResponse,
  isUploading,
  onUpload,
}) => {
  const originalSizeMB = (compressedImage.originalSize / (1024 * 1024)).toFixed(2);
  const compressedSizeMB = (compressedImage.compressedSize / (1024 * 1024)).toFixed(2);

  // Simulated server peak RAM impact calculation (decoding uncompressed image takes 4 bytes per pixel)
  const uncompressedRamUsageMB = (
    (compressedImage.originalWidth * compressedImage.originalHeight * 4) /
    (1024 * 1024)
  ).toFixed(1);

  const compressedRamUsageMB = (
    (compressedImage.compressedWidth * compressedImage.compressedHeight * 4) /
    (1024 * 1024)
  ).toFixed(1);

  return (
    <div id="server-upload-panel" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              伺服器上傳與防當機架構驗證
            </h3>
            <p className="text-xs text-slate-500">
              驗證前端 Canvas 壓縮如何保護伺服器免於記憶體溢出（OOM Crash）
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{isUploading ? "上傳傳輸中..." : "上傳此壓縮照片至後端 API"}</span>
        </button>
      </div>

      {/* Before & After Server Impact Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Without Frontend Compression (The Danger State) */}
        <div className="bg-red-50/50 border border-red-200/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-red-900">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-600" />
              傳統模式：未壓縮直接上傳
            </span>
            <span className="text-red-600 bg-red-100/80 px-2 py-0.5 rounded text-[10px] font-bold">
              極高伺服器崩潰風險
            </span>
          </div>

          <div className="text-xs space-y-1 text-slate-700">
            <div className="flex justify-between py-1 border-b border-red-100">
              <span className="text-slate-500">上傳傳輸體積：</span>
              <span className="font-mono font-bold text-red-700">{formatBytes(compressedImage.originalSize)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-red-100">
              <span className="text-slate-500">伺服器解碼記憶體峰值：</span>
              <span className="font-mono font-bold text-red-700">約 {uncompressedRamUsageMB} MB RAM</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">多使用者併發結果：</span>
              <span className="font-semibold text-red-600">易觸發 Node.js OOM 重啟當機</span>
            </div>
          </div>
        </div>

        {/* With Canvas 1200px Compression (The Safe State) */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              目前模式：Canvas 前端等比壓縮
            </span>
            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px] font-bold">
              完全安全 · 零負擔
            </span>
          </div>

          <div className="text-xs space-y-1 text-slate-700">
            <div className="flex justify-between py-1 border-b border-emerald-100">
              <span className="text-slate-500">上傳傳輸體積：</span>
              <span className="font-mono font-bold text-emerald-700">{formatBytes(compressedImage.compressedSize)} (&lt; 1MB)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-100">
              <span className="text-slate-500">伺服器解碼記憶體峰值：</span>
              <span className="font-mono font-bold text-emerald-700">僅 ~{compressedRamUsageMB} MB RAM (省 90%+)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">多使用者併發結果：</span>
              <span className="font-semibold text-emerald-700">伺服器秒級響應，永遠順暢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Response Banner (if uploaded) */}
      {uploadResponse && (
        <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>伺服器上傳成功確認！</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              ID: {uploadResponse.fileId}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">存入大小</span>
              <span className="font-mono font-bold text-white">{formatBytes(uploadResponse.storedSize)}</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">寬高尺寸</span>
              <span className="font-mono font-bold text-white">{uploadResponse.dimensions.width} × {uploadResponse.dimensions.height}</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">頻寬節省率</span>
              <span className="font-mono font-bold text-emerald-400">{uploadResponse.savedPercentage}</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">伺服器狀態</span>
              <span className="font-semibold text-emerald-400">{uploadResponse.serverHealthStatus}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-800 p-2.5 rounded-lg">
            {uploadResponse.message}
          </p>
        </div>
      )}
    </div>
  );
};
