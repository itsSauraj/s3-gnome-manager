import { NextRequest, NextResponse } from "next/server";
import { createR2ClientFromRequest } from "@/lib/r2-client-dynamic";
import { R2Operations } from "@/lib/r2-operations";

// GET - List files
export async function GET(request: NextRequest) {
  try {
    const { client, bucket } = createR2ClientFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get("prefix") || "";
    const maxKeys = parseInt(searchParams.get("maxKeys") || "1000");

    const result = await R2Operations.listFiles(client, bucket, prefix, maxKeys);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      {
        error: "Failed to list files",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Upload file
export async function POST(request: NextRequest) {
  try {
    const { client, bucket } = createR2ClientFromRequest(request);
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        { error: "No key provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await R2Operations.uploadFile(
      client,
      bucket,
      key,
      buffer,
      file.type
    );

    return NextResponse.json({
      message: "File uploaded successfully",
      file: result,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete file
export async function DELETE(request: NextRequest) {
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

    await R2Operations.deleteFile(client, bucket, key);

    return NextResponse.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        error: "Failed to delete file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update file (same as upload)
export async function PUT(request: NextRequest) {
  return POST(request);
}
