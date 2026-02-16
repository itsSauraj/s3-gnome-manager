export interface FileUploadOptions {
  file: Buffer | Blob | File;
  key: string;
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface FileMetadata {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
  etag?: string;
  metadata?: Record<string, string>;
}

export interface FileListOptions {
  bucket?: string;
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface FileListResult {
  files: FileMetadata[];
  continuationToken?: string;
  isTruncated: boolean;
}

export interface PresignedUrlOptions {
  key: string;
  bucket?: string;
  expiresIn?: number; // in seconds, default 3600 (1 hour)
}
