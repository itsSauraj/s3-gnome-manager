import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Load credentials from environment variables (if available)
    const credentials = {
      endpoint: process.env.R2_ENDPOINT || "",
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      bucket: process.env.R2_BUCKET || "",
    };

    // Only return if all credentials are set
    if (credentials.endpoint && credentials.accessKeyId && credentials.secretAccessKey && credentials.bucket) {
      return NextResponse.json(credentials);
    }

    return NextResponse.json(
      { error: "Environment credentials not configured" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load environment credentials" },
      { status: 500 }
    );
  }
}
