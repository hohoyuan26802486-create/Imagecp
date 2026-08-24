import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, FileImage, Loader2, Plus, ArrowUpRight } from "lucide-react";
import { SAMPLE_IMAGES, SampleImage, fetchSampleAsFile } from "../utils/sampleImages";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  onBatchSelected?: (files: File[]) => void;
  isProcessing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onBatchSelected,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  // Listen to clipboard paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const pastedFile = new File([blob], `pasted_image_${Date.now()}.png`, {
              type: blob.type,
            });
            onImageSelected(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onImageSelected]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      onImageSelected(files[0]);
    } else if (onBatchSelected) {
      onBatchSelected(Array.from(files));
    } else {
      onImageSelected(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSampleClick = async (sample: SampleImage) => {
    if (isProcessing) return;
    try {
      setLoadingSampleId(sample.id);
      const file = await fetchSampleAsFile(sample);
      onImageSelected(file);
    } catch (err) {
      console.error("Failed to load sample image:", err);
    } finally {
      setLoadingSampleId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            選擇或拖曳照片上傳
          </h3>
          <p className="text-xs text-slate-500">
            支援 JPEG, PNG, WEBP, HEIC 等任意大圖，系統會在瀏覽器以 Canvas 自動等比壓縮
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            支援 Ctrl+V 貼上截圖
          </span>
        </div>
      </div>

      {/* Main Drop Area */}
      <div
        id="image-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/70"
        } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <FileImage className="w-7 h-7" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              點擊此處選取照片，或直接將檔案拖曳至此
            </p>
            <p className="text-xs text-slate-500 mt-1">
              自動執行：縮小至 1200px 寬度 · 0.8 品質 · 1MB 以下防當機壓縮
            </p>
          </div>

          <button
            type="button"
            className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            瀏覽電腦或手機相簿
          </button>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            快速測試範例圖（模擬 4K / 高解析真實大圖）：
          </span>
          <span className="text-[11px] text-slate-400">點擊即刻載入測試</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              id={`sample-btn-${sample.id}`}
              onClick={() => handleSampleClick(sample)}
              disabled={isProcessing || loadingSampleId !== null}
              className="group relative flex flex-col p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 text-left transition-all overflow-hidden"
            >
              <div className="flex items-center justify-between text-slate-800 font-medium text-xs mb-1">
                <span className="truncate pr-1">{sample.category}</span>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {sample.approxSize}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                {sample.name}
              </p>

              {loadingSampleId === sample.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center text-blue-600 text-xs font-semibold gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  下載中...
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
