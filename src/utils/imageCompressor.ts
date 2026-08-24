import { CompressionConfig, CompressionResult, CompressionStepLog } from "../types";

export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  maxWidth: 1200,
  quality: 0.8,
  maxSizeBytes: 1024 * 1024, // 1MB = 1,048,576 bytes
  mimeType: "image/jpeg",
  enforceProportionalScale: true,
  autoIterateUnder1MB: true,
};

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Load image file/blob into an HTMLImageElement
 */
export function loadImageElement(source: File | Blob | string): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = typeof source === "string" ? source : URL.createObjectURL(source);
    img.crossOrigin = "anonymous";

    img.onload = () => {
      resolve({ img, objectUrl });
    };

    img.onerror = (err) => {
      reject(new Error("無法載入照片，請確認檔案格式是否正確。"));
    };

    img.src = objectUrl;
  });
}

/**
 * Canvas-based Proportional Downscaling & Compression Engine
 * Strict Spec: Max Width 1200px, Quality 0.8, Final File Size < 1MB
 */
export async function compressImageWithCanvas(
  fileOrBlob: File | Blob,
  config: Partial<CompressionConfig> = {},
  customFileName?: string
): Promise<CompressionResult> {
  const startTime = performance.now();
  const cfg: CompressionConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...config };

  const originalFileName = customFileName || (fileOrBlob instanceof File ? fileOrBlob.name : "photo.jpg");
  const originalSize = fileOrBlob.size;
  const originalMimeType = fileOrBlob.type || "image/jpeg";

  // 1. Load image
  const { img, objectUrl: originalPreviewUrl } = await loadImageElement(fileOrBlob);
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // 2. Calculate proportional dimensions based on maxWidth = 1200px
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (cfg.enforceProportionalScale && originalWidth > cfg.maxWidth) {
    targetWidth = cfg.maxWidth;
    targetHeight = Math.round((originalHeight * cfg.maxWidth) / originalWidth);
  }

  // 3. Setup HTML5 Canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("無法建立 HTML5 Canvas 2D 繪圖環境");
  }

  // Enable high quality bicubic/bilinear smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw image to canvas with proportional scale
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 4. Initial compression attempt at requested quality (0.8)
  let currentQuality = cfg.quality;
  let currentWidth = targetWidth;
  let currentHeight = targetHeight;
  let iteration = 1;
  const stepLogs: CompressionStepLog[] = [];

  let compressedBlob = await canvasToBlob(canvas, cfg.mimeType, currentQuality);

  stepLogs.push({
    step: iteration,
    width: currentWidth,
    height: currentHeight,
    quality: currentQuality,
    sizeBytes: compressedBlob.size,
    isUnder1MB: compressedBlob.size <= cfg.maxSizeBytes,
    timestamp: Date.now(),
  });

  // 5. If compressed size exceeds 1MB (1024 * 1024), automatically iterate to enforce < 1MB
  if (cfg.autoIterateUnder1MB && compressedBlob.size > cfg.maxSizeBytes) {
    const minQuality = 0.4;
    while (compressedBlob.size > cfg.maxSizeBytes && currentQuality > minQuality && iteration < 8) {
      iteration++;
      currentQuality = Math.max(minQuality, parseFloat((currentQuality - 0.08).toFixed(2)));
      compressedBlob = await canvasToBlob(canvas, cfg.mimeType, currentQuality);

      stepLogs.push({
        step: iteration,
        width: currentWidth,
        height: currentHeight,
        quality: currentQuality,
        sizeBytes: compressedBlob.size,
        isUnder1MB: compressedBlob.size <= cfg.maxSizeBytes,
        timestamp: Date.now(),
      });
    }

    // If still over 1MB after quality reduction, downscale dimensions slightly
    if (compressedBlob.size > cfg.maxSizeBytes) {
      while (compressedBlob.size > cfg.maxSizeBytes && currentWidth > 600 && iteration < 12) {
        iteration++;
        currentWidth = Math.round(currentWidth * 0.9);
        currentHeight = Math.round(currentHeight * 0.9);

        canvas.width = currentWidth;
        canvas.height = currentHeight;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

        compressedBlob = await canvasToBlob(canvas, cfg.mimeType, currentQuality);

        stepLogs.push({
          step: iteration,
          width: currentWidth,
          height: currentHeight,
          quality: currentQuality,
          sizeBytes: compressedBlob.size,
          isUnder1MB: compressedBlob.size <= cfg.maxSizeBytes,
          timestamp: Date.now(),
        });
      }
    }
  }

  const compressedSize = compressedBlob.size;
  const compressedDataUrl = await blobToDataUrl(compressedBlob);
  const durationMs = Math.round(performance.now() - startTime);

  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = originalSize > 0 ? parseFloat(((savedBytes / originalSize) * 100).toFixed(1)) : 0;
  const isStrictlyUnder1MB = compressedSize <= cfg.maxSizeBytes;
  const meetsSpecifications = currentWidth <= cfg.maxWidth && isStrictlyUnder1MB;

  return {
    id: "comp_" + Math.random().toString(36).substring(2, 9),
    originalFileName,
    originalSize,
    originalWidth,
    originalHeight,
    originalMimeType,
    originalPreviewUrl,

    compressedBlob,
    compressedDataUrl,
    compressedSize,
    compressedWidth: currentWidth,
    compressedHeight: currentHeight,
    compressedMimeType: cfg.mimeType,

    savedBytes,
    savedPercentage,
    compressionDurationMs: durationMs,
    iterationsNeeded: iteration,
    stepLogs,
    isStrictlyUnder1MB,
    meetsSpecifications,
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas 轉換為圖片 Blob 失敗"));
        }
      },
      mimeType,
      quality
    );
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("無法讀取 Blob 為 DataURL"));
    };
    reader.readAsDataURL(blob);
  });
}
