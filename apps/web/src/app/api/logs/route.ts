import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userId = searchParams.get("user_id");

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (from) {
    values.push(from);
    conditions.push(`l.clock_in >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`l.clock_in < ($${values.length}::date + interval '1 day')`);
  }
  if (userId) {
    values.push(userId);
    conditions.push(`l.user_id = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT l.id, l.user_id, u.name, u.employee_code, l.clock_in, l.clock_out,
            l.status, l.similarity, l.photo_url, o.name AS office_name
     FROM attendance_logs l
     JOIN users u ON u.id = l.user_id
     LEFT JOIN offices o ON o.id = l.office_id
     ${where}
     ORDER BY l.clock_in DESC
     LIMIT 500`,
    values
  );

  return NextResponse.json(result.rows);
}
