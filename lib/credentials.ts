/**
 * Browser-based credential management
 * Stores R2 credentials in localStorage
 */

export interface R2Credentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

const STORAGE_KEY = "r2_credentials";

export class CredentialsManager {
  static save(credentials: R2Credentials): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error("Failed to save credentials:", error);
      throw new Error("Failed to save credentials");
    }
  }

  static load(): R2Credentials | null {
    try {
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
}
