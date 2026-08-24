import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  FileText,
  Camera,
  MessageSquare,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Palette,
  ShieldCheck,
  Send,
} from "lucide-react";
import { GeminiAnalysisData, CompressionResult } from "../types";

interface AiVisionPanelProps {
  compressedImage: CompressionResult;
  analysisData: GeminiAnalysisData | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: (mode: "comprehensive" | "ocr" | "composition" | "custom", customPrompt?: string) => void;
}

export const AiVisionPanel: React.FC<AiVisionPanelProps> = ({
  compressedImage,
  analysisData,
  isLoading,
  error,
  onAnalyze,
}) => {
  const [activeTab, setActiveTab] = useState<"comprehensive" | "ocr" | "composition" | "custom">("comprehensive");
  const [customPrompt, setCustomPrompt] = useState("");

  const handleRunAnalysis = (mode = activeTab) => {
    onAnalyze(mode, mode === "custom" ? customPrompt : undefined);
  };

  return (
    <div id="ai-vision-panel" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Gemini 3.7 Flash 影像辨識分析
              </h3>
              <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                已接收 &lt;1MB 壓縮圖檔
              </span>
            </div>
            <p className="text-xs text-slate-500">
              透過壓縮後照片進行多模態識別，降低傳輸延遲與 API 負荷
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("comprehensive");
              if (!analysisData && !isLoading) onAnalyze("comprehensive");
            }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === "comprehensive"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            全方位分析
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("ocr");
              if (!analysisData && !isLoading) onAnalyze("ocr");
            }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === "ocr"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            文字擷取 (OCR)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("composition");
              if (!analysisData && !isLoading) onAnalyze("composition");
            }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === "composition"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            攝影構圖
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === "custom"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            自訂提問
          </button>
        </div>
      </div>

      {/* Custom Prompt Input (if in custom mode) */}
      {activeTab === "custom" && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="例如：請數出圖中有幾個人？或圖中的植物是什麼品種？"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customPrompt.trim()) {
                handleRunAnalysis("custom");
              }
            }}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          <button
            type="button"
            onClick={() => handleRunAnalysis("custom")}
            disabled={isLoading || !customPrompt.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            提問
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-slate-600 mt-1">
              小提示：系統使用伺服器端 Gemini 3.7 Flash 進行辨識，請確認環境金鑰是否正常運作。
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Gemini 3.7 Flash 正在辨識影像特徵...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              分析壓縮後相片之主體結構、文字 OCR 與畫質細節
            </p>
          </div>
        </div>
      )}

      {/* Initial Empty State (if not analyzed yet) */}
      {!isLoading && !analysisData && !error && (
        <div className="py-10 text-center bg-slate-50 border border-slate-200 rounded-xl p-6">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">尚未執行 AI 辨識</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            照片已完成 Canvas 等比例壓縮（1200px / 0.8 / &lt;1MB），點擊下方按鈕即可啟動 AI 視覺辨識。
          </p>
          <button
            type="button"
            onClick={() => handleRunAnalysis(activeTab)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            立即開始 Gemini AI 辨識
          </button>
        </div>
      )}

      {/* Render Analysis Results */}
      {!isLoading && analysisData && (
        <div className="space-y-4">
          {/* Main Title & Summary Card */}
          <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                {analysisData.sceneType || "場景識別"}
              </span>
              <span className="text-[11px] text-purple-600 bg-white px-2 py-0.5 rounded-full border border-purple-200 font-medium">
                Gemini 3.7 Flash
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1.5">
              {analysisData.title}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {analysisData.summary}
            </p>

            {analysisData.answerToUserQuery && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200 text-xs text-slate-800">
                <span className="font-semibold text-purple-700 block mb-1">針對您的提問回覆：</span>
                {analysisData.answerToUserQuery}
              </div>
            )}
          </div>

          {/* Grid of Results: Objects, OCR, Compression Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Detected Objects */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  主要識別物件與特徵
                </span>
                <span className="text-slate-400 text-[11px]">
                  共 {analysisData.detectedObjects.length} 個
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {analysisData.detectedObjects.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{obj.name}</span>
                      {obj.details && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{obj.details}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
                      {obj.confidence}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* OCR Extracted Text (or empty state) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  文字辨識 (OCR 內容)
                </span>
                <span className="text-slate-400 text-[11px]">
                  {analysisData.ocrText && analysisData.ocrText.length > 0 ? "已偵測文字" : "未見明顯文字"}
                </span>
              </div>

              {analysisData.ocrText && analysisData.ocrText.length > 0 ? (
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 space-y-1 max-h-48 overflow-y-auto">
                  {analysisData.ocrText.map((textLine, i) => (
                    <div key={i} className="py-0.5 border-b border-slate-100 last:border-0">
                      {textLine}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-500 text-center py-6">
                  照片中無顯著印刷或手寫文字，畫面以圖像視覺為主
                </div>
              )}
            </div>
          </div>

          {/* Photographic Composition & AI Compression Quality Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Composition */}
            {analysisData.compositionReview && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  攝影構圖與光影分析
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-slate-700">
                  <p><span className="font-semibold text-slate-900">構圖類型：</span>{analysisData.compositionReview.compositionType}</p>
                  <p><span className="font-semibold text-slate-900">光影氛圍：</span>{analysisData.compositionReview.lighting}</p>
                  <p><span className="font-semibold text-slate-900">清晰度評價：</span>{analysisData.compositionReview.clarity}</p>
                  <p className="text-slate-600 pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-900">建議：</span>{analysisData.compositionReview.suggestions}
                  </p>
                </div>
              </div>
            )}

            {/* AI Compression Quality Feedback */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                AI 壓縮品質認證評語
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  1200px / 0.8 規格細節保存度：極優
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {analysisData.compressionQualityFeedback}
                </p>
              </div>
            </div>
          </div>

          {/* Color Palette & Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Color Palette */}
            {analysisData.primaryColorPalette && analysisData.primaryColorPalette.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  主要色調：
                </span>
                <div className="flex items-center gap-1.5">
                  {analysisData.primaryColorPalette.map((color, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {analysisData.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
