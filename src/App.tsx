import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SpecificationBanner } from "./components/SpecificationBanner";
import { ImageUploader } from "./components/ImageUploader";
import { CompressionInspector } from "./components/CompressionInspector";
import { AiVisionPanel } from "./components/AiVisionPanel";
import { ServerUploadSimulator } from "./components/ServerUploadSimulator";
import { BatchCompressor } from "./components/BatchCompressor";
import { SettingsBar } from "./components/SettingsBar";
import {
  CompressionConfig,
  CompressionResult,
  GeminiAnalysisData,
  UploadServerResponse,
} from "./types";
import {
  compressImageWithCanvas,
  DEFAULT_COMPRESSION_CONFIG,
  formatBytes,
} from "./utils/imageCompressor";
import { SAMPLE_IMAGES, fetchSampleAsFile } from "./utils/sampleImages";
import { CheckCircle2, AlertCircle, Sparkles, Zap, Info } from "lucide-react";

export default function App() {
  const [config, setConfig] = useState<CompressionConfig>(DEFAULT_COMPRESSION_CONFIG);
  const [currentResult, setCurrentResult] = useState<CompressionResult | null>(null);
  const [batchResults, setBatchResults] = useState<CompressionResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // AI Vision state
  const [analysisData, setAnalysisData] = useState<GeminiAnalysisData | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Server Upload state
  const [uploadResponse, setUploadResponse] = useState<UploadServerResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Process a single image with Canvas compression
  const processImage = async (file: File) => {
    try {
      setIsCompressing(true);
      setAnalysisData(null);
      setAiError(null);
      setUploadResponse(null);

      const result = await compressImageWithCanvas(file, config);
      setCurrentResult(result);
      setBatchResults((prev) => [result, ...prev.filter((item) => item.id !== result.id)]);

      showToast(
        `壓縮成功！體積由 ${formatBytes(result.originalSize)} 降至 ${formatBytes(result.compressedSize)} (-${result.savedPercentage}%)`,
        "success"
      );
    } catch (err: unknown) {
      console.error("Compression failed:", err);
      const msg = err instanceof Error ? err.message : "圖片壓縮失敗";
      showToast(msg, "error");
    } finally {
      setIsCompressing(false);
    }
  };

  // Process batch files
  const processBatchImages = async (files: File[]) => {
    try {
      setIsCompressing(true);
      showToast(`正在批次壓縮 ${files.length} 張照片...`, "info");

      const results: CompressionResult[] = [];
      for (const file of files) {
        try {
          const res = await compressImageWithCanvas(file, config);
          results.push(res);
        } catch (e) {
          console.error("Batch item failed:", file.name, e);
        }
      }

      if (results.length > 0) {
        setBatchResults((prev) => [...results, ...prev]);
        setCurrentResult(results[0]);
        setAnalysisData(null);
        setUploadResponse(null);
        showToast(`已完成 ${results.length} 張照片之 Canvas 壓縮！`, "success");
      }
    } catch (err: unknown) {
      console.error("Batch processing failed:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Automatically load the first sample on first visit to demonstrate instantly
  useEffect(() => {
    const initDemo = async () => {
      try {
        const demoSample = SAMPLE_IMAGES[0];
        const file = await fetchSampleAsFile(demoSample);
        await processImage(file);
      } catch (err) {
        console.log("Auto-demo initialization skipped:", err);
      }
    };
    initDemo();
  }, []);

  // Trigger AI analysis with Gemini 3.7 Flash
  const handleAiAnalysis = async (
    mode: "comprehensive" | "ocr" | "composition" | "custom" = "comprehensive",
    customPrompt?: string
  ) => {
    if (!currentResult) return;

    try {
      setIsAiAnalyzing(true);
      setAiError(null);

      const response = await fetch("/api/gemini/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentResult.compressedDataUrl,
          mimeType: currentResult.compressedMimeType,
          analysisMode: mode,
          customPrompt,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || json.hint || "AI 辨識服務回傳錯誤");
      }

      setAnalysisData(json.data);
      showToast("Gemini 3.7 Flash 辨識分析完成！", "success");

      // Scroll to AI panel
      document.getElementById("ai-vision-panel")?.scrollIntoView({ behavior: "smooth" });
    } catch (err: unknown) {
      console.error("AI Analysis failed:", err);
      const msg = err instanceof Error ? err.message : "AI 分析遭遇問題";
      setAiError(msg);
      showToast(msg, "error");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Trigger server upload
  const handleServerUpload = async () => {
    if (!currentResult) return;

    try {
      setIsUploading(true);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: currentResult.originalFileName,
          fileSize: currentResult.compressedSize,
          originalSize: currentResult.originalSize,
          dimensions: {
            width: currentResult.compressedWidth,
            height: currentResult.compressedHeight,
          },
          quality: config.quality,
          mimeType: currentResult.compressedMimeType,
          imageBase64: currentResult.compressedDataUrl,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "伺服器上傳失敗");
      }

      setUploadResponse(json);
      showToast("照片已成功存入伺服器，已省去 90%+ 伺服器負載！", "success");

      // Scroll to upload panel
      document.getElementById("server-upload-panel")?.scrollIntoView({ behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Server upload error:", err);
      const msg = err instanceof Error ? err.message : "伺服器上傳發生錯誤";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Specification Flow Architecture Overview */}
        <SpecificationBanner />

        {/* Compression Engine Parameters Bar */}
        <SettingsBar config={config} onChange={setConfig} />

        {/* Image Uploader & Dropzone */}
        <ImageUploader
          onImageSelected={processImage}
          onBatchSelected={processBatchImages}
          isProcessing={isCompressing}
        />

        {/* Compression Inspector & Comparison */}
        {currentResult && (
          <div className="space-y-6">
            <CompressionInspector
              result={currentResult}
              onTriggerAiAnalysis={() => handleAiAnalysis("comprehensive")}
              onTriggerServerUpload={handleServerUpload}
              isAiAnalyzing={isAiAnalyzing}
              isUploading={isUploading}
            />

            {/* AI Vision Panel (Gemini 3.7 Flash) */}
            <AiVisionPanel
              compressedImage={currentResult}
              analysisData={analysisData}
              isLoading={isAiAnalyzing}
              error={aiError}
              onAnalyze={handleAiAnalysis}
            />

            {/* Server Upload Simulator & Health Protection */}
            <ServerUploadSimulator
              compressedImage={currentResult}
              uploadResponse={uploadResponse}
              isUploading={isUploading}
              onUpload={handleServerUpload}
            />
          </div>
        )}

        {/* Batch Queue Section */}
        {batchResults.length > 0 && (
          <BatchCompressor
            batchResults={batchResults}
            onSelectResult={(res) => {
              setCurrentResult(res);
              setAnalysisData(null);
              setUploadResponse(null);
              window.scrollTo({ top: 400, behavior: "smooth" });
            }}
            onClearBatch={() => {
              setBatchResults([]);
              if (currentResult) {
                setBatchResults([currentResult]);
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 前端圖片 Canvas 等比壓縮與 AI 影像辨識小程式 · 嚴格規格 1200px / Q0.8 / &lt;1MB</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>HTML5 Canvas 2D</span>
            <span>·</span>
            <span>Gemini 3.7 Flash</span>
            <span>·</span>
            <span>Express Backend</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900/95 backdrop-blur-md text-white text-xs font-medium rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
