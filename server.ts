import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();

  // Support JSON payloads up to 25MB for base64 image transfers
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Photo Upload Endpoint (Receives compressed photo payload)
  app.post("/api/upload", (req, res) => {
    try {
      const {
        fileName = "photo.jpg",
        fileSize = 0,
        originalSize = 0,
        dimensions = { width: 0, height: 0 },
        quality = 0.8,
        mimeType = "image/jpeg",
      } = req.body;

      // Validate specifications
      const isUnder1MB = fileSize <= 1024 * 1024;
      const isWithinMaxWidth = dimensions.width <= 1200;
      const savedBytes = Math.max(0, originalSize - fileSize);
      const savedPercentage = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : "0";

      const fileId = "img_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();

      // Simulated server performance & storage metrics
      const serverMemorySavedMB = (savedBytes / (1024 * 1024)).toFixed(2);
      const simulatedServerLoadRisk = fileSize > 5 * 1024 * 1024 ? "High Risk (Uncompressed)" : "Safe & Optimal";

      res.json({
        success: true,
        fileId,
        fileName,
        storedSize: fileSize,
        originalSize,
        savedBytes,
        savedPercentage: `${savedPercentage}%`,
        dimensions,
        quality,
        mimeType,
        isUnder1MB,
        isWithinMaxWidth,
        serverMemorySavedMB: `${serverMemorySavedMB} MB`,
        serverHealthStatus: simulatedServerLoadRisk,
        uploadedAt: new Date().toISOString(),
        message: "照片已成功以優化尺寸存入伺服器，有效避免後端崩潰與記憶體溢出！",
      });
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Internal Server Error";
      res.status(500).json({ error: message });
    }
  });

  // AI Multimodal Vision Analysis Endpoint (Gemini 3.7 Flash)
  app.post("/api/gemini/analyze-photo", async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = "image/jpeg",
        analysisMode = "comprehensive",
        customPrompt = "",
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 data in request." });
      }

      // Clean base64 string if data URL prefix was passed
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

      const ai = getGeminiClient();

      let systemPrompt = `你是一個專業的高精度多模態視覺 AI 專家與影像分析師。
使用者上傳了一張經過前端 Canvas 智慧壓縮（寬度上限 1200px、品質 0.8、體積 < 1MB）的照片。
請針對這張照片進行深入、專業、結構化的分析，並以繁體中文（台灣習慣用語）進行回覆。`;

      let prompt = `請分析這張壓縮後的照片。請提供：
1. 照片主題與概要描述（1-2句精準說明）
2. 視覺場景分類（例如：室內、自然風景、人物特寫、文件掃描、美食、科技等）
3. 主要識別物件列表（包含物件名稱、信心度、視覺特徵或位置）
4. 影像光影與構圖評價（例如：光線充足度、色彩對比、對焦清晰度、構圖手法）
5. 文字 OCR 辨識結果（若圖中有任何可見文字、招牌或標籤，請提取出來；若無則填空）
6. 實用標籤（Tags，5-8個）
7. 壓縮品質評估（確認前端壓縮至 1200px / 0.8 quality 後，主體紋理與細節是否依然清晰完好）`;

      if (analysisMode === "ocr") {
        prompt = `請專注於這張照片中的文字擷取（OCR）。請提取圖中所有文字內容、段落結構、語言，並給出文字總結。`;
      } else if (analysisMode === "composition") {
        prompt = `請專注於這張照片的攝影構圖、色彩調色、採光分析、景深、視覺焦點與改善建議。`;
      } else if (analysisMode === "custom" && customPrompt) {
        prompt = `針對這張照片，請回答使用者的專屬提問：\n「${customPrompt}」\n並提供相關的視覺佐證與觀察。`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: cleanBase64,
                },
              },
              {
                text: `${systemPrompt}\n\n任務需求：\n${prompt}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "照片主題或簡要標題" },
              summary: { type: Type.STRING, description: "照片概要說明" },
              sceneType: { type: Type.STRING, description: "場景類型" },
              primaryColorPalette: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "主導色調名稱或Hex/色彩描述 (3-5個)",
              },
              detectedObjects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "物件名稱" },
                    confidence: { type: Type.STRING, description: "辨識信心度（如 95% 或 高）" },
                    details: { type: Type.STRING, description: "細節特徵或所在位置" },
                  },
                  required: ["name", "confidence"],
                },
                description: "辨識出的主要物體清單",
              },
              ocrText: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "辨識出的文字列表（若無則為空陣列）",
              },
              compositionReview: {
                type: Type.OBJECT,
                properties: {
                  lighting: { type: Type.STRING, description: "光線與曝光評價" },
                  clarity: { type: Type.STRING, description: "銳利度與細節保留度" },
                  compositionType: { type: Type.STRING, description: "構圖類型（如三分法、居中、對角線等）" },
                  suggestions: { type: Type.STRING, description: "攝影或改善建議" },
                },
                required: ["lighting", "clarity", "compositionType", "suggestions"],
              },
              compressionQualityFeedback: {
                type: Type.STRING,
                description: "對經過 1200px / 0.8 quality 壓縮後圖像品質的專業評語",
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "標籤關鍵字",
              },
              answerToUserQuery: {
                type: Type.STRING,
                description: "若有自訂問題，回覆該問題的詳細內容",
              },
            },
            required: [
              "title",
              "summary",
              "sceneType",
              "detectedObjects",
              "tags",
              "compressionQualityFeedback",
            ],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);

      res.json({
        success: true,
        data: parsedData,
        modelUsed: "gemini-3.7-flash",
        analyzedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      console.error("Gemini Vision Analysis Error:", err);
      const message = err instanceof Error ? err.message : "AI 分析時發生未預期的錯誤";
      res.status(500).json({
        error: message,
        hint: "請確認已在 Settings > Secrets 正確設定 GEMINI_API_KEY",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
