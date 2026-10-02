import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, latitude, longitude, radius_meters, is_active } = await req.json();

  if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { message: "name, latitude, dan longitude wajib diisi" },
      { status: 400 }
    );
  }

  const result = await pool.query(
    `UPDATE offices
     SET name = $1, latitude = $2, longitude = $3, radius_meters = $4, is_active = $5
     WHERE id = $6
     RETURNING id, name, latitude, longitude, radius_meters, is_active, created_at`,
    [name, latitude, longitude, radius_meters ?? 30, is_active !== false, id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ message: "Kantor tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await pool.query("DELETE FROM offices WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ message: "Kantor tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ message: "Kantor dihapus" });
}
