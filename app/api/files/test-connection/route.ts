import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const endpoint = request.headers.get("X-R2-Endpoint");
    const accessKeyId = request.headers.get("X-R2-Access-Key-Id");
    const secretAccessKey = request.headers.get("X-R2-Secret-Access-Key");
    const bucket = request.headers.get("X-R2-Bucket");

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    // Test connection by listing files
    const client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1,
    });

    await client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Connection test failed:", error);
    return NextResponse.json(
      {
        error: "Connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 }
    );
  }
}
