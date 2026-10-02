import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT id, name, latitude, longitude, radius_meters, is_active, created_at
     FROM offices ORDER BY created_at ASC`
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { name, latitude, longitude, radius_meters } = await req.json();

  if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { message: "name, latitude, dan longitude wajib diisi" },
      { status: 400 }
    );
  }

  const result = await pool.query(
    `INSERT INTO offices (name, latitude, longitude, radius_meters)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, latitude, longitude, radius_meters, is_active, created_at`,
    [name, latitude, longitude, radius_meters ?? 30]
  );

  return NextResponse.json(result.rows[0]);
}
