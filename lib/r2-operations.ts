/**
 * R2 operations that work with a provided S3 client
 * (Can be used with custom credentials)
 */

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { FileMetadata, FileListResult } from "./types";

export class R2Operations {
  static async listFiles(
    client: S3Client,
    bucket: string,
    prefix: string = "",
    maxKeys: number = 1000
  ): Promise<FileListResult> {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await client.send(command);

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
  }

  static async uploadFile(
    client: S3Client,
    bucket: string,
    key: string,
    file: Buffer,
    contentType?: string
  ): Promise<FileMetadata> {
    const upload = new Upload({
      client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      },
    });

    const result = await upload.done();

    return {
      key,
      size: 0,
      lastModified: new Date(),
      contentType,
      etag: result.ETag,
    };
  }

  static async downloadFile(
    client: S3Client,
    bucket: string,
    key: string
  ): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await client.send(command);
    const stream = response.Body as ReadableStream;
    const chunks: Uint8Array[] = [];

    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    return Buffer.concat(chunks);
  }

  static async getFileMetadata(
    client: S3Client,
    bucket: string,
    key: string
  ): Promise<FileMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await client.send(command);

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
      throw error;
    }
  }

  static async deleteFile(
    client: S3Client,
    bucket: string,
    key: string
  ): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);
  }

  static async deleteFiles(
    client: S3Client,
    bucket: string,
    keys: string[]
  ): Promise<void> {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    await client.send(command);
  }

  static async copyFile(
    client: S3Client,
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string
  ): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: destinationBucket,
      CopySource: `${sourceBucket}/${sourceKey}`,
      Key: destinationKey,
    });

    await client.send(command);
  }

  static async moveFile(
    client: S3Client,
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string
  ): Promise<void> {
    await this.copyFile(
      client,
      sourceBucket,
      sourceKey,
      destinationBucket,
      destinationKey
    );
    await this.deleteFile(client, sourceBucket, sourceKey);
  }
}
