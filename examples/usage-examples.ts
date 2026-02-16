/**
 * R2 File Manager - Usage Examples
 *
 * This file contains practical examples of how to use the R2 File Manager
 * in various scenarios. Copy and adapt these examples for your use case.
 */

import { R2FileManager } from "@/lib/r2-file-manager";
import {
  formatFileSize,
  generateUniqueKey,
  getMimeType,
  isValidFileSize,
  isValidFileType,
  sanitizeFileKey,
  filterFilesByQuery,
  sortFiles,
} from "@/lib/file-utils";

// ============================================================================
// Example 1: Simple File Upload
// ============================================================================

export async function simpleUpload(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await R2FileManager.uploadFile({
    file: buffer,
    key: file.name,
    contentType: file.type,
  });

  console.log("File uploaded:", result);
  return result;
}

// ============================================================================
// Example 2: Upload with Validation
// ============================================================================

export async function validatedUpload(file: File) {
  // Validate file type
  const allowedTypes = ["jpg", "jpeg", "png", "gif", "pdf"];
  if (!isValidFileType(file.name, allowedTypes)) {
    throw new Error(
      `Invalid file type. Allowed: ${allowedTypes.join(", ")}`
    );
  }

  // Validate file size (max 10MB)
  if (!isValidFileSize(file.size, 10)) {
    throw new Error("File size exceeds 10MB limit");
  }

  // Generate unique key to prevent overwrites
  const uniqueKey = generateUniqueKey(file.name, "uploads/");

  const buffer = Buffer.from(await file.arrayBuffer());

  return await R2FileManager.uploadFile({
    file: buffer,
    key: uniqueKey,
    contentType: getMimeType(file.name),
    metadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size.toString(),
    },
  });
}

// ============================================================================
// Example 3: Upload to Different Folders by Category
// ============================================================================

export async function categorizedUpload(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  let folder = "other/";

  // Categorize by file type
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
    folder = "images/";
  } else if (["mp4", "avi", "mov"].includes(ext || "")) {
    folder = "videos/";
  } else if (["pdf", "doc", "docx"].includes(ext || "")) {
    folder = "documents/";
  }

  const key = generateUniqueKey(file.name, folder);
  const buffer = Buffer.from(await file.arrayBuffer());

  return await R2FileManager.uploadFile({
    file: buffer,
    key,
    contentType: getMimeType(file.name),
  });
}

// ============================================================================
// Example 4: List Files with Filtering and Sorting
// ============================================================================

export async function listAndFilterFiles(searchQuery?: string) {
  // List all files
  const result = await R2FileManager.listFiles({
    maxKeys: 1000,
  });

  let files = result.files;

  // Filter by search query
  if (searchQuery) {
    files = filterFilesByQuery(files, searchQuery);
  }

  // Sort by date (newest first)
  files = sortFiles(files, "date", "desc");

  return files;
}

// ============================================================================
// Example 5: List Files in Specific Folder
// ============================================================================

export async function listFolderFiles(folderPath: string) {
  const result = await R2FileManager.listFiles({
    prefix: folderPath.endsWith("/") ? folderPath : `${folderPath}/`,
  });

  return result.files.map((file) => ({
    ...file,
    formattedSize: formatFileSize(file.size),
    fileName: file.key.split("/").pop(),
  }));
}

// ============================================================================
// Example 6: Download and Save File
// ============================================================================

export async function downloadAndSave(key: string, savePath: string) {
  const buffer = await R2FileManager.getFileBuffer(key);

  // In Node.js environment
  const fs = require("fs");
  fs.writeFileSync(savePath, buffer);

  console.log(`File saved to ${savePath}`);
}

// ============================================================================
// Example 7: Generate Temporary Download Link
// ============================================================================

export async function generateTemporaryLink(key: string, expiresInHours = 1) {
  const url = await R2FileManager.getPresignedUrl({
    key,
    expiresIn: expiresInHours * 3600, // Convert hours to seconds
  });

  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

  return {
    url,
    expiresAt: expiresAt.toISOString(),
    message: `Link expires in ${expiresInHours} hour(s)`,
  };
}

// ============================================================================
// Example 8: Batch Delete Files
// ============================================================================

export async function batchDeleteOldFiles(olderThanDays: number) {
  const result = await R2FileManager.listFiles();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  // Filter old files
  const oldFiles = result.files.filter(
    (file) => file.lastModified < cutoffDate
  );

  if (oldFiles.length === 0) {
    console.log("No old files to delete");
    return;
  }

  const keys = oldFiles.map((file) => file.key);
  await R2FileManager.deleteFiles(keys);

  console.log(`Deleted ${keys.length} files older than ${olderThanDays} days`);
  return keys;
}

// ============================================================================
// Example 9: Copy Files to Backup Folder
// ============================================================================

export async function backupFiles(sourcePrefix: string) {
  const result = await R2FileManager.listFiles({
    prefix: sourcePrefix,
  });

  const backupPromises = result.files.map(async (file) => {
    const backupKey = `backups/${new Date().toISOString().split("T")[0]}/${file.key}`;
    await R2FileManager.copyFile(file.key, backupKey);
    return backupKey;
  });

  const backedUpFiles = await Promise.all(backupPromises);
  console.log(`Backed up ${backedUpFiles.length} files`);
  return backedUpFiles;
}

// ============================================================================
// Example 10: Move Files Between Folders
// ============================================================================

export async function reorganizeFiles(
  oldFolder: string,
  newFolder: string
) {
  const result = await R2FileManager.listFiles({
    prefix: oldFolder,
  });

  const movePromises = result.files.map(async (file) => {
    const newKey = file.key.replace(oldFolder, newFolder);
    await R2FileManager.moveFile(file.key, newKey);
    return { from: file.key, to: newKey };
  });

  const movedFiles = await Promise.all(movePromises);
  console.log(`Moved ${movedFiles.length} files`);
  return movedFiles;
}

// ============================================================================
// Example 11: Check File Exists Before Upload
// ============================================================================

export async function uploadIfNotExists(file: File, key: string) {
  const exists = await R2FileManager.fileExists(key);

  if (exists) {
    // Optionally, generate a new key with timestamp
    const uniqueKey = generateUniqueKey(file.name, key.split("/").slice(0, -1).join("/") + "/");
    key = uniqueKey;
    console.log(`File exists, using new key: ${key}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return await R2FileManager.uploadFile({
    file: buffer,
    key,
    contentType: file.type,
  });
}

// ============================================================================
// Example 12: Get File Information
// ============================================================================

export async function getFileInfo(key: string) {
  const metadata = await R2FileManager.getFileMetadata(key);

  if (!metadata) {
    throw new Error("File not found");
  }

  return {
    key: metadata.key,
    size: formatFileSize(metadata.size),
    sizeBytes: metadata.size,
    lastModified: metadata.lastModified.toISOString(),
    contentType: metadata.contentType,
    etag: metadata.etag,
    metadata: metadata.metadata,
  };
}

// ============================================================================
// Example 13: Direct Upload via Presigned URL (Client-Side)
// ============================================================================

export async function clientSideUpload(file: File, key: string) {
  // Step 1: Get presigned upload URL from your API
  const response = await fetch("/api/files/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      contentType: file.type,
      expiresIn: 300, // 5 minutes
    }),
  });

  const { url } = await response.json();

  // Step 2: Upload file directly to R2 using presigned URL
  const uploadResponse = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload failed");
  }

  return { key, success: true };
}

// ============================================================================
// Example 14: Batch Operations via API
// ============================================================================

export async function batchDeleteViaAPI(keys: string[]) {
  const response = await fetch("/api/files/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operation: "delete",
      files: keys.map((key) => ({ key })),
    }),
  });

  return await response.json();
}

export async function batchCopyViaAPI(
  operations: Array<{ source: string; destination: string }>
) {
  const response = await fetch("/api/files/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operation: "copy",
      files: operations,
    }),
  });

  return await response.json();
}

// ============================================================================
// Example 15: Search and Replace in File Keys
// ============================================================================

export async function renameFilePattern(
  searchPattern: string,
  replacement: string
) {
  const result = await R2FileManager.listFiles();

  const filesToRename = result.files.filter((file) =>
    file.key.includes(searchPattern)
  );

  const renamePromises = filesToRename.map(async (file) => {
    const newKey = file.key.replace(searchPattern, replacement);
    await R2FileManager.moveFile(file.key, newKey);
    return { old: file.key, new: newKey };
  });

  return await Promise.all(renamePromises);
}

// ============================================================================
// Example 16: Get Storage Statistics
// ============================================================================

export async function getStorageStats(prefix?: string) {
  const result = await R2FileManager.listFiles({ prefix });

  const totalSize = result.files.reduce((sum, file) => sum + file.size, 0);
  const fileCount = result.files.length;

  // Group by file type
  const fileTypes: Record<string, number> = {};
  result.files.forEach((file) => {
    const ext = file.key.split(".").pop()?.toLowerCase() || "unknown";
    fileTypes[ext] = (fileTypes[ext] || 0) + 1;
  });

  return {
    totalFiles: fileCount,
    totalSize: formatFileSize(totalSize),
    totalSizeBytes: totalSize,
    fileTypes,
    averageFileSize: formatFileSize(totalSize / fileCount),
  };
}

// ============================================================================
// Example 17: Duplicate File Detection
// ============================================================================

export async function findDuplicateFiles() {
  const result = await R2FileManager.listFiles();

  // Group files by ETag (content hash)
  const etagMap = new Map<string, string[]>();

  result.files.forEach((file) => {
    if (file.etag) {
      const existing = etagMap.get(file.etag) || [];
      existing.push(file.key);
      etagMap.set(file.etag, existing);
    }
  });

  // Find duplicates (same ETag, different keys)
  const duplicates: Array<{ etag: string; files: string[] }> = [];

  etagMap.forEach((files, etag) => {
    if (files.length > 1) {
      duplicates.push({ etag, files });
    }
  });

  return duplicates;
}

// ============================================================================
// Example 18: Upload with Progress Tracking
// ============================================================================

export async function uploadWithProgress(
  file: File,
  onProgress?: (progress: number) => void
) {
  // For large files, you might want to use multipart upload with progress tracking
  // This is a simplified example

  const buffer = Buffer.from(await file.arrayBuffer());

  if (onProgress) {
    onProgress(50); // Simulate progress
  }

  const result = await R2FileManager.uploadFile({
    file: buffer,
    key: generateUniqueKey(file.name, "uploads/"),
    contentType: file.type,
  });

  if (onProgress) {
    onProgress(100);
  }

  return result;
}
