import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: "Username dan password wajib diisi" }, { status: 400 });
  }

  const result = await pool.query<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM admins WHERE username = $1",
    [username]
  );
  const admin = result.rows[0];

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return NextResponse.json({ message: "Username atau password salah" }, { status: 401 });
  }

  const token = await createSessionToken({ sub: admin.id, username });

  const res = NextResponse.json({ username });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
