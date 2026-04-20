

export type AttachmentCategory = "IMAGE" | "VIDEO" | "FILE";

export type UploadStatus =
 | "waiting"
 | "presigning"
 | "uploading"
 | "uploaded"
 | "processing"
 | "done"
 | "error"
 | "cancelled";

export interface LocalAttachment {

 localId:string;

 uri:string;

 fileName:string;

 mimeType:string;

 fileSize:number;

 status:UploadStatus;

 progress:number;

 retryCount:number;

 isOptimistic:boolean;

 checksum?:string;

 uploadId?:string;
 fileUrl?:string;
 key?:string;

 publicUrl?:string;

 startedAt?:number;

}

// ── Validation limits (match your backend) ────────────────────────────────
export const LIMITS = {
  maxFiles: 10,
  maxImageBytes: 25 * 1024 * 1024,   // 25 MB
  maxVideoBytes: 50 * 1024 * 1024,   // 50 MB
  maxDocumentBytes: 50 * 1024 * 1024, // 50 MB
} as const;

// ── Allowed MIME types (must match AllowedFileTypes.java) ─────────────────
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
]);

export const ALLOWED_ALL_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
]);

export function getCategoryFromMime(mimeType: string): AttachmentCategory | null {
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) return "image";
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) return "video";
  if (ALLOWED_DOCUMENT_TYPES.has(mimeType)) return "document";
  return null;
}

export function getLimitForCategory(cat: AttachmentCategory): number {
  if (cat === "image") return LIMITS.maxImageBytes;
  if (cat === "video") return LIMITS.maxVideoBytes;
  return LIMITS.maxDocumentBytes;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns a human-readable error string or null if valid */
export function validateAttachment(
  mimeType: string,
  fileSize: number,
  currentCount: number
): string | null {
  if (currentCount >= LIMITS.maxFiles)
    return `Max ${LIMITS.maxFiles} files per message`;

  const cat = getCategoryFromMime(mimeType);
  if (!cat) return "File type not supported";

  const limit = getLimitForCategory(cat);
  if (fileSize > limit) {
    const label = cat === "image" ? "25 MB" : "50 MB";
    return `${cat.charAt(0).toUpperCase() + cat.slice(1)} must be under ${label}`;
  }
  return null;
}
