import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { minioClient } from "@/lib/minio";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL ?? "http://localhost:8000";

async function checkDb() {
  const start = Date.now();
  try {
    await pool.query("SELECT 1");
    return { status: "ok" as const, latencyMs: Date.now() - start };
  } catch {
    return { status: "down" as const, latencyMs: null };
  }
}

async function checkMinio() {
  const start = Date.now();
  try {
    await minioClient.listBuckets();
    return { status: "ok" as const, latencyMs: Date.now() - start };
  } catch {
    return { status: "down" as const, latencyMs: null };
  }
}

async function checkAiEngine() {
  const start = Date.now();
  try {
    const res = await fetch(`${AI_ENGINE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { status: "down" as const, latencyMs: null, modelLoaded: false };
    const data = await res.json();
    return {
      status: "ok" as const,
      latencyMs: Date.now() - start,
      modelLoaded: Boolean(data.model_loaded),
    };
  } catch {
    return { status: "down" as const, latencyMs: null, modelLoaded: false };
  }
}

export async function GET() {
  const [db, minio, ai] = await Promise.all([checkDb(), checkMinio(), checkAiEngine()]);
  return NextResponse.json({ db, minio, ai, checkedAt: new Date().toISOString() });
}
