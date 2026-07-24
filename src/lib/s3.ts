import { S3Client } from "@aws-sdk/client-s3";

// Fail fast if credentials are absent so misconfiguration is caught at startup
// rather than producing cryptic AWS errors at request time.
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error(
    "[s3] AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in the environment."
  );
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
