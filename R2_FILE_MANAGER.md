# Cloudflare R2 File Manager

A comprehensive file management system for Cloudflare R2 with full CRUD operations, built with Next.js, TypeScript, and DaisyUI.

## Features

- ✅ **Create**: Upload files to R2 buckets
- ✅ **Read**: List, download, and get file metadata
- ✅ **Update**: Update existing files, copy, and move files
- ✅ **Delete**: Delete single or multiple files
- ✅ **Presigned URLs**: Generate temporary URLs for secure access
- ✅ **Multipart Upload**: Support for large file uploads
- ✅ **DaisyUI Interface**: Beautiful, responsive UI

## Setup

### 1. Environment Variables

Copy `.env.sample` to `.env` and fill in your Cloudflare R2 credentials:

```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=your-bucket-name
R2_COMPONENTS_BUCKET=your-components-bucket-name
```

### 2. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the file manager interface.

## File Structure

```
├── lib/
│   ├── r2-client.ts          # R2 client configuration
│   ├── r2-file-manager.ts    # Core file management logic
│   └── types.ts              # TypeScript types
├── components/
│   └── FileManager.tsx       # DaisyUI file manager component
├── app/
│   ├── api/
│   │   └── files/
│   │       ├── route.ts      # API endpoints (GET, POST, DELETE, PUT)
│   │       └── download/
│   │           └── route.ts  # Download endpoint
│   └── page.tsx              # Main page
└── .env.sample               # Environment variables template
```

## Usage Examples

### Programmatic Usage

#### Upload a File

```typescript
import { R2FileManager } from "@/lib/r2-file-manager";

const file = new File(["content"], "example.txt");
const buffer = Buffer.from(await file.arrayBuffer());

const result = await R2FileManager.uploadFile({
  file: buffer,
  key: "folder/example.txt",
  contentType: "text/plain",
  metadata: {
    uploadedBy: "user123",
  },
});
```

#### Download a File

```typescript
const buffer = await R2FileManager.getFileBuffer("folder/example.txt");
// or get a stream
const stream = await R2FileManager.downloadFile("folder/example.txt");
```

#### List Files

```typescript
const result = await R2FileManager.listFiles({
  prefix: "folder/",
  maxKeys: 100,
});

console.log(result.files);
// [{ key: "folder/example.txt", size: 1024, lastModified: Date, ... }]
```

#### Delete a File

```typescript
await R2FileManager.deleteFile("folder/example.txt");
```

#### Delete Multiple Files

```typescript
await R2FileManager.deleteFiles([
  "folder/file1.txt",
  "folder/file2.txt",
]);
```

#### Copy a File

```typescript
await R2FileManager.copyFile(
  "folder/original.txt",
  "folder/copy.txt"
);
```

#### Move a File

```typescript
await R2FileManager.moveFile(
  "folder/old-location.txt",
  "folder/new-location.txt"
);
```

#### Get File Metadata

```typescript
const metadata = await R2FileManager.getFileMetadata("folder/example.txt");
console.log(metadata);
// { key, size, lastModified, contentType, etag, metadata }
```

#### Check if File Exists

```typescript
const exists = await R2FileManager.fileExists("folder/example.txt");
```

#### Generate Presigned URL (Download)

```typescript
const url = await R2FileManager.getPresignedUrl({
  key: "folder/example.txt",
  expiresIn: 3600, // 1 hour
});
```

#### Generate Presigned URL (Upload)

```typescript
const uploadUrl = await R2FileManager.getPresignedUploadUrl({
  key: "folder/new-file.txt",
  contentType: "text/plain",
  expiresIn: 3600,
});

// Client can now upload directly to this URL
```

### API Endpoints

#### GET /api/files

List files in the bucket.

**Query Parameters:**
- `prefix` (optional): Filter files by prefix
- `maxKeys` (optional): Maximum number of files to return (default: 1000)

**Response:**
```json
{
  "files": [
    {
      "key": "folder/example.txt",
      "size": 1024,
      "lastModified": "2026-02-16T10:00:00.000Z",
      "etag": "\"abc123\""
    }
  ],
  "isTruncated": false
}
```

#### POST /api/files

Upload a file.

**Body:** FormData
- `file`: File to upload
- `key`: Destination key in R2

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "key": "folder/example.txt",
    "size": 1024,
    "contentType": "text/plain"
  }
}
```

#### DELETE /api/files

Delete a file.

**Query Parameters:**
- `key`: Key of the file to delete

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

#### GET /api/files/download

Download a file.

**Query Parameters:**
- `key`: Key of the file to download

**Response:** File contents with appropriate headers

## Using Multiple Buckets

By default, operations use the `R2_BUCKET` from your environment variables. To use a different bucket:

```typescript
// Upload to components bucket
await R2FileManager.uploadFile({
  file: buffer,
  key: "component.js",
  bucket: process.env.R2_COMPONENTS_BUCKET,
});

// List files from components bucket
const result = await R2FileManager.listFiles({
  bucket: process.env.R2_COMPONENTS_BUCKET,
});
```

## DaisyUI Themes

The FileManager component uses DaisyUI classes. To customize the theme, update your `tailwind.config.js`:

```javascript
module.exports = {
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};
```

## Error Handling

All methods throw errors that can be caught:

```typescript
try {
  await R2FileManager.uploadFile(options);
} catch (error) {
  console.error("Upload failed:", error.message);
}
```

## TypeScript Types

All types are exported from `@/lib/types`:

```typescript
import type {
  FileUploadOptions,
  FileMetadata,
  FileListOptions,
  FileListResult,
  PresignedUrlOptions,
} from "@/lib/types";
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` to version control
2. **API Routes**: Consider adding authentication to API routes
3. **Presigned URLs**: Set appropriate expiration times
4. **File Validation**: Validate file types and sizes on upload
5. **CORS**: Configure CORS settings in R2 bucket if needed

## License

This project is part of your application and follows your application's license.
