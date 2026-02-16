import { NextRequest, NextResponse } from "next/server";
import { createR2ClientFromRequest } from "@/lib/r2-client-dynamic";
import { R2Operations } from "@/lib/r2-operations";

// GET - Download file
export async function GET(request: NextRequest) {
  try {
    const { client, bucket } = createR2ClientFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "No key provided" },
        { status: 400 }
      );
    }

    const buffer = await R2Operations.downloadFile(client, bucket, key);
    const metadata = await R2Operations.getFileMetadata(client, bucket, key);

    if (!metadata) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const filename = key.split("/").pop() || "download";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      {
        error: "Failed to download file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
