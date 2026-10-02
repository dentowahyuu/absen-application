import { NextRequest, NextResponse } from "next/server";
import { minioClient } from "@/lib/minio";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [bucket, ...objectParts] = path;
  const objectName = objectParts.join("/");

  if (!bucket || !objectName) {
    return NextResponse.json({ message: "Path foto tidak valid" }, { status: 400 });
  }

  try {
    const stream = await minioClient.getObject(bucket, objectName);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    return new NextResponse(new Uint8Array(Buffer.concat(chunks)), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=60" },
    });
  } catch {
    return NextResponse.json({ message: "Foto tidak ditemukan" }, { status: 404 });
  }
}
