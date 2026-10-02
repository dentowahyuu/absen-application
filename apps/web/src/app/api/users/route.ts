import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { toSql } from "pgvector/pg";
import { pool } from "@/lib/db";
import { extractEmbedding, NoFaceDetectedError } from "@/lib/ai";
import { uploadImage, BUCKETS } from "@/lib/minio";

export async function GET() {
  const result = await pool.query(
    `SELECT u.id, u.employee_code, u.name, u.email, u.department, u.is_active, u.created_at,
            f.photo_url
     FROM users u
     LEFT JOIN LATERAL (
       SELECT photo_url FROM user_faces WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
     ) f ON true
     ORDER BY u.created_at DESC`
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const employeeCode = formData.get("employee_code");
  const name = formData.get("name");
  const email = formData.get("email");
  const department = formData.get("department");
  const photo = formData.get("photo");

  if (!employeeCode || !name || !(photo instanceof Blob)) {
    return NextResponse.json(
      { message: "employee_code, name, dan photo wajib diisi" },
      { status: 400 }
    );
  }

  let embedding: number[];
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query<{ id: string }>(
      `INSERT INTO users (employee_code, name, email, department)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [employeeCode, name, email || null, department || null]
    );
    const userId = userResult.rows[0].id;

    const buffer = Buffer.from(await photo.arrayBuffer());
    const objectName = `${userId}/${uuid()}.jpg`;
    const photoUrl = await uploadImage(BUCKETS.profiles, objectName, buffer);

    await client.query(
      `INSERT INTO user_faces (user_id, face_embedding, photo_url)
       VALUES ($1, $2, $3)`,
      [userId, toSql(embedding), photoUrl]
    );

    await client.query("COMMIT");

    return NextResponse.json({ id: userId, employee_code: employeeCode, name, photo_url: photoUrl });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "23505") {
      return NextResponse.json({ message: "Kode karyawan sudah terdaftar" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ message: "Gagal menyimpan data karyawan" }, { status: 500 });
  } finally {
    client.release();
  }
}
