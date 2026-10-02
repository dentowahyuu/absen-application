import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { toSql } from "pgvector/pg";
import { pool } from "@/lib/db";
import { extractEmbedding, NoFaceDetectedError } from "@/lib/ai";
import { uploadImage, BUCKETS } from "@/lib/minio";
import { haversineDistanceMeters } from "@/lib/geo";

const MATCH_THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD ?? 0.8);

interface OfficeRow {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const photo = formData.get("photo");
  const latitudeRaw = formData.get("latitude");
  const longitudeRaw = formData.get("longitude");

  if (!photo || !(photo instanceof Blob)) {
    return NextResponse.json({ message: "Foto tidak ditemukan" }, { status: 400 });
  }

  const latitude = Number(latitudeRaw);
  const longitude = Number(longitudeRaw);
  if (!latitudeRaw || !longitudeRaw || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json(
      { message: "Lokasi GPS tidak ditemukan. Izinkan akses lokasi pada browser." },
      { status: 400 }
    );
  }

  const offices = await pool.query<OfficeRow>(
    "SELECT id, name, latitude, longitude, radius_meters FROM offices WHERE is_active = TRUE"
  );

  let nearestOffice: (OfficeRow & { distance: number }) | null = null;
  for (const office of offices.rows) {
    const distance = haversineDistanceMeters(latitude, longitude, office.latitude, office.longitude);
    if (!nearestOffice || distance < nearestOffice.distance) {
      nearestOffice = { ...office, distance };
    }
  }

  if (!nearestOffice || nearestOffice.distance > nearestOffice.radius_meters) {
    return NextResponse.json(
      {
        message: nearestOffice
          ? `Anda berada ${Math.round(nearestOffice.distance)}m dari ${nearestOffice.name} (maks. ${nearestOffice.radius_meters}m)`
          : "Lokasi kantor belum diatur oleh admin",
        nearest_office: nearestOffice?.name ?? null,
        distance_meters: nearestOffice ? Math.round(nearestOffice.distance) : null,
      },
      { status: 403 }
    );
  }

  let embedding: number[];
  try {
    const extracted = await extractEmbedding(photo, "snapshot.jpg");
    embedding = extracted.embedding;
  } catch (err) {
    if (err instanceof NoFaceDetectedError) {
      return NextResponse.json({ message: "Wajah tidak terdeteksi" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "AI engine tidak dapat dihubungi" }, { status: 502 });
  }

  const match = await pool.query<{ user_id: string; name: string; similarity: number }>(
    `SELECT u.id AS user_id, u.name, 1 - (f.face_embedding <=> $1) AS similarity
     FROM user_faces f
     JOIN users u ON u.id = f.user_id
     WHERE u.is_active = TRUE
     ORDER BY f.face_embedding <=> $1 ASC
     LIMIT 1`,
    [toSql(embedding)]
  );

  const best = match.rows[0];
  if (!best || best.similarity < MATCH_THRESHOLD) {
    return NextResponse.json(
      {
        message: "Wajah tidak dikenali",
        closest_match: best ? best.name : null,
        similarity: best ? best.similarity : null,
        threshold: MATCH_THRESHOLD,
      },
      { status: 404 }
    );
  }

  const buffer = Buffer.from(await photo.arrayBuffer());
  const objectName = `${best.user_id}/${Date.now()}-${uuid()}.jpg`;
  const photoUrl = await uploadImage(BUCKETS.evidence, objectName, buffer);

  const todayOpenLog = await pool.query<{ id: string }>(
    `SELECT id FROM attendance_logs
     WHERE user_id = $1 AND clock_in::date = CURRENT_DATE AND clock_out IS NULL
     ORDER BY clock_in DESC LIMIT 1`,
    [best.user_id]
  );

  let status: "clock_in" | "clock_out";
  let timestamp: string;

  if (todayOpenLog.rows[0]) {
    status = "clock_out";
    const updated = await pool.query<{ clock_out: string }>(
      `UPDATE attendance_logs
       SET clock_out = now(), similarity = $2, photo_url = $3, office_id = $4
       WHERE id = $1
       RETURNING clock_out`,
      [todayOpenLog.rows[0].id, best.similarity, photoUrl, nearestOffice.id]
    );
    timestamp = updated.rows[0].clock_out;
  } else {
    status = "clock_in";
    const inserted = await pool.query<{ clock_in: string }>(
      `INSERT INTO attendance_logs (user_id, clock_in, status, similarity, photo_url, office_id)
       VALUES ($1, now(), 'present', $2, $3, $4)
       RETURNING clock_in`,
      [best.user_id, best.similarity, photoUrl, nearestOffice.id]
    );
    timestamp = inserted.rows[0].clock_in;
  }

  return NextResponse.json({
    status: "success",
    user_name: best.name,
    attendance_status: status,
    timestamp,
    similarity: best.similarity,
    office_name: nearestOffice.name,
  });
}
