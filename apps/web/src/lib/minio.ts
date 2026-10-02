import { Client } from "minio";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: Number(process.env.MINIO_PORT_INTERNAL ?? 9000),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
});

export const BUCKETS = {
  evidence: process.env.MINIO_BUCKET_EVIDENCE ?? "attendance-evidence",
  profiles: process.env.MINIO_BUCKET_PROFILES ?? "employee-profiles",
};

async function ensureBucket(bucket: string) {
  const exists = await minioClient.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }
}

export async function ensureBuckets() {
  await Promise.all([ensureBucket(BUCKETS.evidence), ensureBucket(BUCKETS.profiles)]);
}

export async function uploadImage(
  bucket: string,
  objectName: string,
  buffer: Buffer,
  contentType = "image/jpeg"
): Promise<string> {
  await ensureBucket(bucket);
  await minioClient.putObject(bucket, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  });
  return `${bucket}/${objectName}`;
}
