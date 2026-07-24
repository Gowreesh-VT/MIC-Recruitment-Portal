import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";
import crypto from "crypto";

const ALLOWED_EXTENSIONS = new Set(["pdf", "zip", "png", "jpeg", "jpg"]);

/**
 * Server-side extension → MIME mapping.
 *
 * SECURITY: We derive the Content-Type from the validated extension instead of
 * trusting the client-supplied value. This prevents an attacker from declaring
 * `application/octet-stream` but uploading an HTML/JS/SVG file, which S3 would
 * serve with the client-provided Content-Type and potentially enable stored XSS.
 */
const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { filename } = await req.json();

    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ success: false, error: "Missing filename." }, { status: 400 });
    }

    // Extract & validate file extension
    const parts = filename.split(".");
    if (parts.length < 2) {
      return NextResponse.json({ success: false, error: "Filename must include a valid file extension." }, { status: 400 });
    }

    const extension = parts.pop()?.toLowerCase() ?? "";

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { success: false, error: "Invalid file extension. Only .pdf, .zip, .png, .jpeg, and .jpg files are allowed." },
        { status: 400 }
      );
    }

    // Derive Content-Type server-side — never use client-supplied value
    const contentType = EXTENSION_TO_MIME[extension];

    const bucketName = process.env.AWS_S3_BUCKET_NAME || "";
    if (!bucketName) {
      console.error("[Upload] AWS_S3_BUCKET_NAME is not configured.");
      return NextResponse.json({ success: false, error: "Storage configuration error." }, { status: 500 });
    }

    // Generate a unique object key
    const uniqueId = crypto.randomUUID();
    const objectKey = `submissions/${session.user.id}/${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // Generate presigned URL (expires in 5 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const finalUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${objectKey}`;

    return NextResponse.json({
      success: true,
      presignedUrl,
      finalUrl,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate upload URL." }, { status: 500 });
  }
}
