/**
 * Utility functions for file operations
 */

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file extension from filename or key
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text
    txt: "text/plain",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    xml: "application/xml",
    csv: "text/csv",
    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    "7z": "application/x-7z-compressed",
    // Media
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    wav: "audio/wav",
    // Code
    ts: "text/typescript",
    tsx: "text/tsx",
    jsx: "text/jsx",
    py: "text/x-python",
    java: "text/x-java-source",
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    go: "text/x-go",
    rs: "text/x-rust",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Validate file type against allowed types
 */
export function isValidFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
}

/**
 * Validate file size
 */
export function isValidFileSize(bytes: number, maxSizeInMB: number): boolean {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return bytes <= maxBytes;
}

/**
 * Generate a unique file key with timestamp
 */
export function generateUniqueKey(originalFilename: string, prefix = ""): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = getFileExtension(originalFilename);
  const basename = originalFilename.replace(`.${ext}`, "");
  const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, "_");
  return `${prefix}${sanitized}_${timestamp}_${random}.${ext}`;
}

/**
 * Sanitize file key (remove special characters, ensure valid path)
 */
export function sanitizeFileKey(key: string): string {
  return key
    .replace(/\\/g, "/") // Replace backslashes with forward slashes
    .replace(/\/+/g, "/") // Remove duplicate slashes
    .replace(/^\/+/, "") // Remove leading slashes
    .replace(/[<>:"|?*]/g, "_"); // Replace invalid characters
}

/**
 * Extract folder path from file key
 */
export function getFolderPath(key: string): string {
  const parts = key.split("/");
  parts.pop(); // Remove filename
  return parts.join("/");
}

/**
 * Get filename from file key
 */
export function getFilename(key: string): string {
  const parts = key.split("/");
  return parts[parts.length - 1];
}

/**
 * Check if file is an image
 */
export function isImage(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  return imageExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is a video
 */
export function isVideo(filename: string): boolean {
  const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"];
  return videoExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is audio
 */
export function isAudio(filename: string): boolean {
  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
  return audioExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is a document
 */
export function isDocument(filename: string): boolean {
  const docExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];
  return docExtensions.includes(getFileExtension(filename));
}

/**
 * Get file category
 */
export function getFileCategory(filename: string): string {
  if (isImage(filename)) return "image";
  if (isVideo(filename)) return "video";
  if (isAudio(filename)) return "audio";
  if (isDocument(filename)) return "document";
  return "other";
}

/**
 * Convert File to Buffer (for Node.js environments)
 */
export async function fileToBuffer(file: File | Blob): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Create a folder structure from a flat list of keys
 */
export interface FolderNode {
  name: string;
  type: "file" | "folder";
  key?: string;
  children?: FolderNode[];
}

export function createFolderStructure(keys: string[]): FolderNode[] {
  const root: FolderNode[] = [];

  keys.forEach((key) => {
    const parts = key.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let existing = currentLevel.find((node) => node.name === part);

      if (!existing) {
        existing = {
          name: part,
          type: isFile ? "file" : "folder",
          ...(isFile ? { key } : { children: [] }),
        };
        currentLevel.push(existing);
      }

      if (!isFile && existing.children) {
        currentLevel = existing.children;
      }
    });
  });

  return root;
}

/**
 * Filter files by search query
 */
export function filterFilesByQuery<T extends { key: string }>(
  files: T[],
  query: string
): T[] {
  if (!query) return files;
  const lowerQuery = query.toLowerCase();
  return files.filter((file) => file.key.toLowerCase().includes(lowerQuery));
}

/**
 * Sort files by various criteria
 */
export function sortFiles<T extends { key: string; lastModified?: Date; size?: number }>(
  files: T[],
  sortBy: "name" | "date" | "size" = "name",
  order: "asc" | "desc" = "asc"
): T[] {
  const sorted = [...files].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.key.localeCompare(b.key);
        break;
      case "date":
        if (a.lastModified && b.lastModified) {
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
        }
        break;
      case "size":
        if (a.size !== undefined && b.size !== undefined) {
          comparison = a.size - b.size;
        }
        break;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}
