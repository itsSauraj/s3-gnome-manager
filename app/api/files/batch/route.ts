import { NextRequest, NextResponse } from "next/server";
import { createR2ClientFromRequest } from "@/lib/r2-client-dynamic";
import { R2Operations } from "@/lib/r2-operations";

// POST - Batch operations (delete, copy, move)
export async function POST(request: NextRequest) {
  try {
    const { client, bucket } = createR2ClientFromRequest(request);
    const body = await request.json();
    const { operation, files } = body;

    if (!operation || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { operation, files }" },
        { status: 400 }
      );
    }

    const results: {
      success: boolean;
      key?: string;
      source?: string;
      destination?: string;
      error?: string;
    }[] = [];

    switch (operation) {
      case "delete":
        try {
          const keys = files.map((f) => f.key || f);
          await R2Operations.deleteFiles(client, bucket, keys);
          results.push(...keys.map((key) => ({ success: true, key })));
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        break;

      case "copy":
        for (const file of files) {
          try {
            await R2Operations.copyFile(
              client,
              file.sourceBucket || bucket,
              file.source,
              file.destinationBucket || bucket,
              file.destination
            );
            results.push({
              success: true,
              source: file.source,
              destination: file.destination,
            });
          } catch (error) {
            results.push({
              success: false,
              source: file.source,
              destination: file.destination,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
        break;

      case "move":
        for (const file of files) {
          try {
            await R2Operations.moveFile(
              client,
              file.sourceBucket || bucket,
              file.source,
              file.destinationBucket || bucket,
              file.destination
            );
            results.push({
              success: true,
              source: file.source,
              destination: file.destination,
            });
          } catch (error) {
            results.push({
              success: false,
              source: file.source,
              destination: file.destination,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}. Supported: delete, copy, move` },
          { status: 400 }
        );
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Batch ${operation} completed`,
      total: results.length,
      success: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error("Error in batch operation:", error);
    return NextResponse.json(
      {
        error: "Failed to perform batch operation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
