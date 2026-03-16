import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || "fra1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET || "",
  },
  forcePathStyle: false,
});

const BUCKET = process.env.DO_SPACES_BUCKET || "isce-image";
const PREFIX =
  process.env.DO_SPACES_DOCS_PREFIX || "isce-store-customer-custome-design";

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload a file to DigitalOcean Spaces
 */
export async function uploadToSpaces(
  file: Buffer,
  fileName: string,
  contentType: string,
  userId?: string,
): Promise<UploadResult> {
  try {
    // Generate unique key with prefix and optional user folder
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = userId
      ? `${PREFIX}/${userId}/${timestamp}-${sanitizedFileName}`
      : `${PREFIX}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Construct the public URL
    const url = `${process.env.DO_SPACES_ENDPOINT}/${BUCKET}/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error("Error uploading to Spaces:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete a file from DigitalOcean Spaces
 */
export async function deleteFromSpaces(
  key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error deleting from Spaces:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Generate a presigned URL for direct upload (optional, for large files)
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  userId?: string,
): Promise<{
  success: boolean;
  uploadUrl?: string;
  key?: string;
  publicUrl?: string;
  error?: string;
}> {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = userId
      ? `${PREFIX}/${userId}/${timestamp}-${sanitizedFileName}`
      : `${PREFIX}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    const publicUrl = `${process.env.DO_SPACES_ENDPOINT}/${BUCKET}/${key}`;

    return {
      success: true,
      uploadUrl,
      key,
      publicUrl,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate upload URL",
    };
  }
}
