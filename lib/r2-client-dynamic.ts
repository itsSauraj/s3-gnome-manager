import { S3Client } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";

/**
 * Create an R2 client from request headers or environment variables
 */
export function createR2ClientFromRequest(request: NextRequest): {
  client: S3Client;
  bucket: string;
} {
  // Try to get credentials from headers first
  const endpoint = request.headers.get("X-R2-Endpoint") || process.env.R2_ENDPOINT;
  const accessKeyId = request.headers.get("X-R2-Access-Key-Id") || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = request.headers.get("X-R2-Secret-Access-Key") || process.env.R2_SECRET_ACCESS_KEY;
  const bucket = request.headers.get("X-R2-Bucket") || process.env.R2_BUCKET || "";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials not provided");
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket };
}
