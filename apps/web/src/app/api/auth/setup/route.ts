import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { SESSION_COOKIE, createSessionToken, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password || String(password).length < 8) {
    return NextResponse.json(
      { message: "Username wajib diisi dan password minimal 8 karakter" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    const countResult = await client.query("SELECT count(*) FROM admins");
    if (Number(countResult.rows[0].count) > 0) {
      return NextResponse.json(
        { message: "Akun admin sudah ada, silakan login" },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const inserted = await client.query<{ id: string }>(
      "INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id",
      [username, passwordHash]
    );

    const token = await createSessionToken({ sub: inserted.rows[0].id, username });

    const res = NextResponse.json({ username });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "23505") {
      return NextResponse.json({ message: "Username sudah dipakai" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ message: "Gagal membuat akun admin" }, { status: 500 });
  } finally {
    client.release();
  }
}
