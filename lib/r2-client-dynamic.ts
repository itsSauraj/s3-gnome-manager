import { S3Client } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";

/**
 * Create an R2 client from credentials provided in the request headers.
 * Credentials are supplied by the user (stored in the browser) and sent
 * with each request — the app does not read any environment variables.
 */
export function createR2ClientFromRequest(request: NextRequest): {
  client: S3Client;
  bucket: string;
} {
  const endpoint = request.headers.get("X-R2-Endpoint");
  const accessKeyId = request.headers.get("X-R2-Access-Key-Id");
  const secretAccessKey = request.headers.get("X-R2-Secret-Access-Key");
  const bucket = request.headers.get("X-R2-Bucket") || "";

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
