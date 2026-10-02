import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const countResult = await pool.query("SELECT count(*) FROM admins");
  const hasAdmin = Number(countResult.rows[0].count) > 0;

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  return NextResponse.json({
    hasAdmin,
    authenticated: Boolean(session),
    username: session?.username ?? null,
  });
}
