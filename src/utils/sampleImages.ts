export interface SampleImage {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  approxSize: string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: "sample-dslr",
    name: "高解析風景 (4K 山嵐與湖泊)",
    category: "風景攝影",
    description: "大尺寸 3840x2160 超清風光，測試 1200px 等比例壓縮率",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=3840&q=100",
    approxSize: "~6.2 MB",
  },
  {
    id: "sample-food",
    name: "精緻料理特寫 (美食攝影)",
    category: "美食微距",
    description: "細膩紋理與色彩層次，驗證 0.8 品質下的細節保留度",
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=3000&q=100",
    approxSize: "~4.8 MB",
  },
  {
    id: "sample-document",
    name: "實體紙本收據與文字 (OCR 測試)",
    category: "文件辨識",
    description: "測試文字清晰度與 Gemini OCR 擷取準確度",
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=3200&q=100",
    approxSize: "~3.9 MB",
  },
  {
    id: "sample-city",
    name: "都會建築夜景 (高對比光影)",
    category: "建築夜景",
    description: "夜間暗部雜訊與霓虹光影，檢驗伺服器防當機壓縮成效",
    url: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=3400&q=100",
    approxSize: "~5.5 MB",
  },
];

/**
 * Fetch remote sample image and convert into a browser File object
 */
export async function fetchSampleAsFile(sample: SampleImage): Promise<File> {
  const res = await fetch(sample.url);
  if (!res.ok) {
    throw new Error(`無法載入範例圖片: HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const file = new File([blob], `${sample.name}.jpg`, { type: "image/jpeg" });
  return file;
}
