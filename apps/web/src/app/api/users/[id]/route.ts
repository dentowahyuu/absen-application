import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { toSql } from "pgvector/pg";
import { pool } from "@/lib/db";
import { extractEmbedding, NoFaceDetectedError } from "@/lib/ai";
import { uploadImage, BUCKETS } from "@/lib/minio";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();

  const employeeCode = formData.get("employee_code");
  const name = formData.get("name");
  const email = formData.get("email");
  const department = formData.get("department");
  const isActive = formData.get("is_active");
  const photo = formData.get("photo");

  if (!employeeCode || !name) {
    return NextResponse.json({ message: "employee_code dan name wajib diisi" }, { status: 400 });
  }

  let embedding: number[] | null = null;
  if (photo instanceof Blob && photo.size > 0) {
    try {
      const extracted = await extractEmbedding(photo, "profile.jpg");
      embedding = extracted.embedding;
    } catch (err) {
      if (err instanceof NoFaceDetectedError) {
        return NextResponse.json({ message: "Wajah tidak terdeteksi pada foto" }, { status: 400 });
      }
      console.error(err);
      return NextResponse.json({ message: "AI engine tidak dapat dihubungi" }, { status: 502 });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE users
       SET employee_code = $1, name = $2, email = $3, department = $4,
           is_active = $5, updated_at = now()
       WHERE id = $6
       RETURNING id`,
      [employeeCode, name, email || null, department || null, isActive !== "false", id]
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Karyawan tidak ditemukan" }, { status: 404 });
    }

    if (embedding && photo instanceof Blob) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const objectName = `${id}/${uuid()}.jpg`;
      const photoUrl = await uploadImage(BUCKETS.profiles, objectName, buffer);

      await client.query("DELETE FROM user_faces WHERE user_id = $1", [id]);
      await client.query(
        `INSERT INTO user_faces (user_id, face_embedding, photo_url) VALUES ($1, $2, $3)`,
        [id, toSql(embedding), photoUrl]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ id, employee_code: employeeCode, name });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "23505") {
      return NextResponse.json({ message: "Kode karyawan sudah dipakai" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ message: "Gagal memperbarui data karyawan" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ message: "Karyawan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ message: "Karyawan dihapus" });
}
