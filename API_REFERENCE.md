# R2 File Manager - API Reference

Complete API reference for all available endpoints and methods.

## Table of Contents

- [REST API Endpoints](#rest-api-endpoints)
- [R2FileManager Methods](#r2filemanager-methods)
- [File Utilities](#file-utilities)
- [TypeScript Types](#typescript-types)

---

## REST API Endpoints

### Files API (`/api/files`)

#### GET - List Files

List files in the R2 bucket with optional filtering.

**Query Parameters:**
```typescript
{
  prefix?: string;      // Filter by prefix (folder path)
  maxKeys?: number;     // Max files to return (default: 1000)
}
```

**Response:**
```json
{
  "files": [
    {
      "key": "folder/file.txt",
      "size": 1024,
      "lastModified": "2026-02-16T10:00:00.000Z",
      "etag": "\"abc123\""
    }
  ],
  "isTruncated": false,
  "continuationToken": null
}
```

#### POST - Upload File

Upload a file to R2.

**Body:** `multipart/form-data`
```typescript
{
  file: File;           // The file to upload
  key: string;          // Destination key in R2
}
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "key": "uploads/file.txt",
    "size": 0,
    "lastModified": "2026-02-16T10:00:00.000Z",
    "contentType": "text/plain"
  }
}
```

#### DELETE - Delete File

Delete a file from R2.

**Query Parameters:**
```typescript
{
  key: string;          // Key of file to delete
}
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

#### PUT - Update File

Update an existing file (same as POST).

---

### Download API (`/api/files/download`)

#### GET - Download File

Download a file from R2.

**Query Parameters:**
```typescript
{
  key: string;          // Key of file to download
}
```

**Response:** File contents with headers:
- `Content-Type`: MIME type of file
- `Content-Disposition`: `attachment; filename="..."`
- `Content-Length`: File size in bytes

---

### Presigned URLs API (`/api/files/presigned`)

#### GET - Generate Presigned Download URL

Generate a temporary URL for downloading a file.

**Query Parameters:**
```typescript
{
  key: string;          // Key of file
  expiresIn?: number;   // Expiry time in seconds (default: 3600)
}
```

**Response:**
```json
{
  "url": "https://...",
  "key": "folder/file.txt",
  "expiresIn": 3600,
  "expiresAt": "2026-02-16T11:00:00.000Z"
}
```

#### POST - Generate Presigned Upload URL

Generate a temporary URL for uploading a file directly to R2.

**Body:**
```json
{
  "key": "folder/file.txt",
  "contentType": "image/png",
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "url": "https://...",
  "key": "folder/file.txt",
  "contentType": "image/png",
  "expiresIn": 3600,
  "expiresAt": "2026-02-16T11:00:00.000Z",
  "instructions": {
    "method": "PUT",
    "headers": {
      "Content-Type": "image/png"
    },
    "note": "Upload file directly to this URL using PUT method"
  }
}
```

**Usage Example:**
```typescript
// Get presigned URL
const { url } = await fetch('/api/files/presigned', {
  method: 'POST',
  body: JSON.stringify({ key: 'image.png', contentType: 'image/png' })
}).then(r => r.json());

// Upload directly to R2
await fetch(url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'image/png' }
});
```

---

### Batch Operations API (`/api/files/batch`)

#### POST - Batch Operations

Perform batch operations on multiple files.

**Body:**
```json
{
  "operation": "delete" | "copy" | "move",
  "files": [...]
}
```

**Delete Operation:**
```json
{
  "operation": "delete",
  "files": ["file1.txt", "file2.txt"]
  // or
  "files": [{ "key": "file1.txt" }, { "key": "file2.txt" }]
}
```

**Copy Operation:**
```json
{
  "operation": "copy",
  "files": [
    {
      "source": "folder/old.txt",
      "destination": "folder/new.txt",
      "sourceBucket": "optional",
      "destinationBucket": "optional"
    }
  ]
}
```

**Move Operation:**
```json
{
  "operation": "move",
  "files": [
    {
      "source": "old/location.txt",
      "destination": "new/location.txt"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Batch delete completed",
  "total": 2,
  "success": 2,
  "failed": 0,
  "results": [
    { "success": true, "key": "file1.txt" },
    { "success": true, "key": "file2.txt" }
  ]
}
```

---

## R2FileManager Methods

Complete reference for the `R2FileManager` class methods.

### Upload Operations

#### `uploadFile(options: FileUploadOptions): Promise<FileMetadata>`

Upload a file to R2 with multipart support.

```typescript
const result = await R2FileManager.uploadFile({
  file: buffer,
  key: 'folder/file.txt',
  contentType: 'text/plain',
  metadata: { uploadedBy: 'user123' }
});
```

#### `updateFile(options: FileUploadOptions): Promise<FileMetadata>`

Update an existing file (alias for uploadFile).

### Download Operations

#### `downloadFile(key: string, bucket?: string): Promise<ReadableStream | null>`

Download a file as a stream.

```typescript
const stream = await R2FileManager.downloadFile('folder/file.txt');
```

#### `getFileBuffer(key: string, bucket?: string): Promise<Buffer>`

Download a file as a Buffer.

```typescript
const buffer = await R2FileManager.getFileBuffer('folder/file.txt');
```

### Metadata Operations

#### `getFileMetadata(key: string, bucket?: string): Promise<FileMetadata | null>`

Get file metadata without downloading the file.

```typescript
const metadata = await R2FileManager.getFileMetadata('folder/file.txt');
// { key, size, lastModified, contentType, etag, metadata }
```

#### `fileExists(key: string, bucket?: string): Promise<boolean>`

Check if a file exists.

```typescript
const exists = await R2FileManager.fileExists('folder/file.txt');
```

### List Operations

#### `listFiles(options?: FileListOptions): Promise<FileListResult>`

List files in a bucket with optional filtering and pagination.

```typescript
const result = await R2FileManager.listFiles({
  prefix: 'folder/',
  maxKeys: 100,
  continuationToken: 'token-from-previous-request'
});
```

### Copy/Move Operations

#### `copyFile(sourceKey: string, destinationKey: string, sourceBucket?: string, destinationBucket?: string): Promise<void>`

Copy a file to a new location.

```typescript
await R2FileManager.copyFile('old/file.txt', 'new/file.txt');
```

#### `moveFile(sourceKey: string, destinationKey: string, sourceBucket?: string, destinationBucket?: string): Promise<void>`

Move a file to a new location (copy + delete).

```typescript
await R2FileManager.moveFile('old/file.txt', 'new/file.txt');
```

### Delete Operations

#### `deleteFile(key: string, bucket?: string): Promise<void>`

Delete a single file.

```typescript
await R2FileManager.deleteFile('folder/file.txt');
```

#### `deleteFiles(keys: string[], bucket?: string): Promise<void>`

Delete multiple files in a single operation.

```typescript
await R2FileManager.deleteFiles(['file1.txt', 'file2.txt', 'file3.txt']);
```

### Presigned URL Operations

#### `getPresignedUrl(options: PresignedUrlOptions): Promise<string>`

Generate a presigned URL for temporary download access.

```typescript
const url = await R2FileManager.getPresignedUrl({
  key: 'folder/file.txt',
  expiresIn: 3600  // 1 hour
});
```

#### `getPresignedUploadUrl(options: PresignedUrlOptions & { contentType?: string }): Promise<string>`

Generate a presigned URL for direct upload.

```typescript
const url = await R2FileManager.getPresignedUploadUrl({
  key: 'folder/file.txt',
  contentType: 'image/png',
  expiresIn: 300  // 5 minutes
});
```

---

## File Utilities

Helper functions from `lib/file-utils.ts`.

### File Size

#### `formatFileSize(bytes: number): string`

Format bytes to human-readable format.

```typescript
formatFileSize(1024);        // "1 KB"
formatFileSize(1048576);     // "1 MB"
formatFileSize(1073741824);  // "1 GB"
```

### File Type Detection

#### `getFileExtension(filename: string): string`

Extract file extension.

```typescript
getFileExtension('document.pdf');  // "pdf"
```

#### `getMimeType(filename: string): string`

Get MIME type from filename.

```typescript
getMimeType('image.png');  // "image/png"
getMimeType('video.mp4');  // "video/mp4"
```

#### `isImage(filename: string): boolean`
#### `isVideo(filename: string): boolean`
#### `isAudio(filename: string): boolean`
#### `isDocument(filename: string): boolean`

Check if file is of a specific category.

```typescript
isImage('photo.jpg');      // true
isVideo('movie.mp4');      // true
isDocument('report.pdf');  // true
```

#### `getFileCategory(filename: string): string`

Get file category: 'image', 'video', 'audio', 'document', or 'other'.

### Validation

#### `isValidFileType(filename: string, allowedTypes: string[]): boolean`

Validate file type against allowed types.

```typescript
isValidFileType('photo.jpg', ['jpg', 'png', 'gif']);  // true
isValidFileType('video.mp4', ['jpg', 'png', 'gif']);  // false
```

#### `isValidFileSize(bytes: number, maxSizeInMB: number): boolean`

Validate file size.

```typescript
isValidFileSize(1024 * 1024, 5);     // true (1MB < 5MB)
isValidFileSize(10 * 1024 * 1024, 5); // false (10MB > 5MB)
```

### Key Management

#### `generateUniqueKey(originalFilename: string, prefix?: string): string`

Generate a unique key with timestamp and random string.

```typescript
generateUniqueKey('photo.jpg', 'uploads/');
// "uploads/photo_1708084800000_abc123.jpg"
```

#### `sanitizeFileKey(key: string): string`

Sanitize file key by removing invalid characters.

```typescript
sanitizeFileKey('folder\\invalid:file?.txt');
// "folder/invalid_file_.txt"
```

#### `getFolderPath(key: string): string`

Extract folder path from key.

```typescript
getFolderPath('folder/subfolder/file.txt');  // "folder/subfolder"
```

#### `getFilename(key: string): string`

Extract filename from key.

```typescript
getFilename('folder/subfolder/file.txt');  // "file.txt"
```

### File Organization

#### `filterFilesByQuery<T>(files: T[], query: string): T[]`

Filter files by search query.

```typescript
const filtered = filterFilesByQuery(files, 'report');
```

#### `sortFiles<T>(files: T[], sortBy: 'name' | 'date' | 'size', order: 'asc' | 'desc'): T[]`

Sort files by various criteria.

```typescript
const sorted = sortFiles(files, 'date', 'desc');  // Newest first
```

#### `createFolderStructure(keys: string[]): FolderNode[]`

Create a folder tree structure from flat file list.

```typescript
const tree = createFolderStructure([
  'folder1/file1.txt',
  'folder1/subfolder/file2.txt',
  'folder2/file3.txt'
]);
```

---

## TypeScript Types

### FileUploadOptions

```typescript
interface FileUploadOptions {
  file: Buffer | Blob | File;
  key: string;
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}
```

### FileMetadata

```typescript
interface FileMetadata {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
  etag?: string;
  metadata?: Record<string, string>;
}
```

### FileListOptions

```typescript
interface FileListOptions {
  bucket?: string;
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}
```

### FileListResult

```typescript
interface FileListResult {
  files: FileMetadata[];
  continuationToken?: string;
  isTruncated: boolean;
}
```

### PresignedUrlOptions

```typescript
interface PresignedUrlOptions {
  key: string;
  bucket?: string;
  expiresIn?: number;  // in seconds, default 3600 (1 hour)
}
```

### FolderNode

```typescript
interface FolderNode {
  name: string;
  type: 'file' | 'folder';
  key?: string;
  children?: FolderNode[];
}
```

---

## Error Handling

All methods throw errors that should be caught:

```typescript
try {
  await R2FileManager.uploadFile(options);
} catch (error) {
  console.error('Upload failed:', error.message);
}
```

API endpoints return error responses:

```json
{
  "error": "Failed to upload file",
  "message": "Detailed error message"
}
```

---

## Rate Limits & Best Practices

1. **Batch Operations**: Use `deleteFiles()` instead of multiple `deleteFile()` calls
2. **Large Files**: Upload operations automatically use multipart upload
3. **Presigned URLs**: Set appropriate expiration times (shorter is more secure)
4. **List Operations**: Use pagination for large buckets (maxKeys + continuationToken)
5. **File Validation**: Always validate file types and sizes before upload

---

For more examples, see [examples/usage-examples.ts](examples/usage-examples.ts)
