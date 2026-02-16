import { NextRequest, NextResponse } from "next/server";
import { R2FileManager } from "@/lib/r2-file-manager";

// GET - Generate presigned download URL
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");
    const expiresIn = parseInt(searchParams.get("expiresIn") || "3600");

    if (!key) {
      return NextResponse.json(
        { error: "No key provided" },
        { status: 400 }
      );
    }

    // Check if file exists first
    const exists = await R2FileManager.fileExists(key);
    if (!exists) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const url = await R2FileManager.getPresignedUrl({
      key,
      expiresIn,
    });

    return NextResponse.json({
      url,
      key,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate presigned URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Generate presigned upload URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, contentType, expiresIn = 3600 } = body;

    if (!key) {
      return NextResponse.json(
        { error: "No key provided" },
        { status: 400 }
      );
    }

    const url = await R2FileManager.getPresignedUploadUrl({
      key,
      contentType,
      expiresIn,
    });

    return NextResponse.json({
      url,
      key,
      contentType,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      instructions: {
        method: "PUT",
        headers: contentType ? { "Content-Type": contentType } : {},
        note: "Upload file directly to this URL using PUT method",
      },
    });
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate presigned upload URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
