export interface CompressionConfig {
  maxWidth: number; // default 1200
  quality: number; // default 0.8
  maxSizeBytes: number; // default 1MB (1024 * 1024)
  mimeType: "image/jpeg" | "image/webp" | "image/png";
  enforceProportionalScale: boolean;
  autoIterateUnder1MB: boolean;
}

export interface CompressionStepLog {
  step: number;
  width: number;
  height: number;
  quality: number;
  sizeBytes: number;
  isUnder1MB: boolean;
  timestamp: number;
}

export interface CompressionResult {
  id: string;
  originalFileName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalMimeType: string;
  originalPreviewUrl: string;

  compressedBlob: Blob;
  compressedDataUrl: string;
  compressedSize: number;
  compressedWidth: number;
  compressedHeight: number;
  compressedMimeType: string;

  savedBytes: number;
  savedPercentage: number;
  compressionDurationMs: number;
  iterationsNeeded: number;
  stepLogs: CompressionStepLog[];
  isStrictlyUnder1MB: boolean;
  meetsSpecifications: boolean; // maxWidth <= 1200 && size <= 1MB
}

export interface DetectedObject {
  name: string;
  confidence: string;
  details?: string;
}

export interface CompositionReview {
  lighting: string;
  clarity: string;
  compositionType: string;
  suggestions: string;
}

export interface GeminiAnalysisData {
  title: string;
  summary: string;
  sceneType: string;
  primaryColorPalette?: string[];
  detectedObjects: DetectedObject[];
  ocrText?: string[];
  compositionReview?: CompositionReview;
  compressionQualityFeedback: string;
  tags: string[];
  answerToUserQuery?: string;
}

export interface UploadServerResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  storedSize: number;
  originalSize: number;
  savedBytes: number;
  savedPercentage: string;
  dimensions: { width: number; height: number };
  quality: number;
  mimeType: string;
  isUnder1MB: boolean;
  isWithinMaxWidth: boolean;
  serverMemorySavedMB: string;
  serverHealthStatus: string;
  uploadedAt: string;
  message: string;
}
