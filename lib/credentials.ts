/**
 * Browser-based credential management
 * Supports multiple buckets
 */

export interface R2Credentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  name?: string; // Display name for the bucket
}

export interface BucketConfig {
  id: string;
  name: string;
  credentials: R2Credentials;
}

const STORAGE_KEY = "r2_credentials";
const BUCKETS_KEY = "r2_buckets";
const CURRENT_BUCKET_KEY = "r2_current_bucket";

export class CredentialsManager {
  // Legacy single-bucket support
  static save(credentials: R2Credentials): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
      // Also add to buckets list
      const bucketConfig: BucketConfig = {
        id: credentials.bucket,
        name: credentials.name || credentials.bucket,
        credentials,
      };
      this.addBucket(bucketConfig);
      this.setCurrentBucket(bucketConfig.id);
    } catch (error) {
      console.error("Failed to save credentials:", error);
      throw new Error("Failed to save credentials");
    }
  }

  static load(): R2Credentials | null {
    try {
      // Try to load current bucket first
      const currentBucketId = this.getCurrentBucketId();
      if (currentBucketId) {
        const bucket = this.getBucket(currentBucketId);
        if (bucket) return bucket.credentials;
      }

      // Fallback to legacy storage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to load credentials:", error);
      return null;
    }
  }

  static remove(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BUCKETS_KEY);
      localStorage.removeItem(CURRENT_BUCKET_KEY);
    } catch (error) {
      console.error("Failed to remove credentials:", error);
    }
  }

  static isAuthenticated(): boolean {
    return this.load() !== null;
  }

  static getHeaders(): Record<string, string> {
    const creds = this.load();
    if (!creds) throw new Error("Not authenticated");

    return {
      "X-R2-Endpoint": creds.endpoint,
      "X-R2-Access-Key-Id": creds.accessKeyId,
      "X-R2-Secret-Access-Key": creds.secretAccessKey,
      "X-R2-Bucket": creds.bucket,
    };
  }

  // Multi-bucket management
  static getBuckets(): BucketConfig[] {
    try {
      const stored = localStorage.getItem(BUCKETS_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to load buckets:", error);
      return [];
    }
  }

  static addBucket(bucket: BucketConfig): void {
    try {
      const buckets = this.getBuckets();
      const existingIndex = buckets.findIndex((b) => b.id === bucket.id);
      if (existingIndex >= 0) {
        buckets[existingIndex] = bucket;
      } else {
        buckets.push(bucket);
      }
      localStorage.setItem(BUCKETS_KEY, JSON.stringify(buckets));
    } catch (error) {
      console.error("Failed to add bucket:", error);
    }
  }

  static removeBucket(bucketId: string): void {
    try {
      const buckets = this.getBuckets().filter((b) => b.id !== bucketId);
      localStorage.setItem(BUCKETS_KEY, JSON.stringify(buckets));
      if (this.getCurrentBucketId() === bucketId) {
        const firstBucket = buckets[0];
        if (firstBucket) {
          this.setCurrentBucket(firstBucket.id);
        } else {
          localStorage.removeItem(CURRENT_BUCKET_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to remove bucket:", error);
    }
  }

  static getBucket(bucketId: string): BucketConfig | null {
    const buckets = this.getBuckets();
    return buckets.find((b) => b.id === bucketId) || null;
  }

  static getCurrentBucketId(): string | null {
    return localStorage.getItem(CURRENT_BUCKET_KEY);
  }

  static setCurrentBucket(bucketId: string): void {
    localStorage.setItem(CURRENT_BUCKET_KEY, bucketId);
  }
}
