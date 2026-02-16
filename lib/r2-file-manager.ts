import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "./r2-client";
import type {
  FileUploadOptions,
  FileMetadata,
  FileListOptions,
  FileListResult,
  PresignedUrlOptions,
} from "./types";

export class R2FileManager {
  /**
   * Upload a file to R2 (CREATE)
   * Supports multipart upload for large files
   */
  static async uploadFile(options: FileUploadOptions): Promise<FileMetadata> {
    const { file, key, bucket = R2_BUCKET, contentType, metadata } = options;

    try {
      const upload = new Upload({
        client: r2Client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: file,
          ContentType: contentType,
          Metadata: metadata,
        },
      });

      const result = await upload.done();

      return {
        key,
        size: 0, // Size not returned by Upload, use getFileMetadata if needed
        lastModified: new Date(),
        contentType,
        etag: result.ETag,
        metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Download a file from R2 (READ)
   * Returns the file as a ReadableStream
   */
  static async downloadFile(
    key: string,
    bucket: string = R2_BUCKET
  ): Promise<ReadableStream | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await r2Client.send(command);
      return response.Body as ReadableStream;
    } catch (error) {
      throw new Error(
        `Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get file as buffer (READ)
   */
  static async getFileBuffer(
    key: string,
    bucket: string = R2_BUCKET
  ): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await r2Client.send(command);
      const stream = response.Body as ReadableStream;
      const chunks: Uint8Array[] = [];

      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      throw new Error(
        `Failed to get file buffer: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get file metadata (READ)
   */
  static async getFileMetadata(
    key: string,
    bucket: string = R2_BUCKET
  ): Promise<FileMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await r2Client.send(command);

      return {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType,
        etag: response.ETag,
        metadata: response.Metadata,
      };
    } catch (error) {
      if ((error as any).$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw new Error(
        `Failed to get file metadata: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Update a file (UPDATE)
   * Same as upload but for updating existing files
   */
  static async updateFile(options: FileUploadOptions): Promise<FileMetadata> {
    return this.uploadFile(options);
  }

  /**
   * Copy a file to a new location (UPDATE)
   */
  static async copyFile(
    sourceKey: string,
    destinationKey: string,
    sourceBucket: string = R2_BUCKET,
    destinationBucket: string = R2_BUCKET
  ): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: destinationBucket,
        CopySource: `${sourceBucket}/${sourceKey}`,
        Key: destinationKey,
      });

      await r2Client.send(command);
    } catch (error) {
      throw new Error(
        `Failed to copy file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Move a file (UPDATE)
   * Copies to new location then deletes the original
   */
  static async moveFile(
    sourceKey: string,
    destinationKey: string,
    sourceBucket: string = R2_BUCKET,
    destinationBucket: string = R2_BUCKET
  ): Promise<void> {
    try {
      await this.copyFile(
        sourceKey,
        destinationKey,
        sourceBucket,
        destinationBucket
      );
      await this.deleteFile(sourceKey, sourceBucket);
    } catch (error) {
      throw new Error(
        `Failed to move file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Delete a file (DELETE)
   */
  static async deleteFile(
    key: string,
    bucket: string = R2_BUCKET
  ): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await r2Client.send(command);
    } catch (error) {
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Delete multiple files (DELETE)
   */
  static async deleteFiles(
    keys: string[],
    bucket: string = R2_BUCKET
  ): Promise<void> {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      });

      await r2Client.send(command);
    } catch (error) {
      throw new Error(
        `Failed to delete files: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * List files in a bucket (READ)
   */
  static async listFiles(
    options: FileListOptions = {}
  ): Promise<FileListResult> {
    const {
      bucket = R2_BUCKET,
      prefix = "",
      maxKeys = 1000,
      continuationToken,
    } = options;

    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
        ContinuationToken: continuationToken,
      });

      const response = await r2Client.send(command);

      const files: FileMetadata[] =
        response.Contents?.map((item) => ({
          key: item.Key || "",
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(),
          etag: item.ETag,
        })) || [];

      return {
        files,
        continuationToken: response.NextContinuationToken,
        isTruncated: response.IsTruncated || false,
      };
    } catch (error) {
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check if a file exists (READ)
   */
  static async fileExists(
    key: string,
    bucket: string = R2_BUCKET
  ): Promise<boolean> {
    const metadata = await this.getFileMetadata(key, bucket);
    return metadata !== null;
  }

  /**
   * Generate a presigned URL for temporary file access (READ)
   */
  static async getPresignedUrl(
    options: PresignedUrlOptions
  ): Promise<string> {
    const { key, bucket = R2_BUCKET, expiresIn = 3600 } = options;

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn });
      return url;
    } catch (error) {
      throw new Error(
        `Failed to generate presigned URL: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate a presigned URL for uploading (CREATE)
   */
  static async getPresignedUploadUrl(
    options: PresignedUrlOptions & { contentType?: string }
  ): Promise<string> {
    const { key, bucket = R2_BUCKET, expiresIn = 3600, contentType } = options;

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn });
      return url;
    } catch (error) {
      throw new Error(
        `Failed to generate presigned upload URL: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
