import {
  db,
  init,
  user,
  session,
  configured,
  digest,
  validOrigin,
} from "@/lib/db";
import { cookies } from "next/headers";
import {
  scryptSync,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
export const runtime = "nodejs";
export async function GET() {
  try {
    return Response.json(
      { user: await user(), configured: configured() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Не удалось подключиться к базе." },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  if (!validOrigin(req))
    return Response.json(
      { error: "Недопустимый источник запроса" },
      { status: 403 },
    );
  if (!configured())
    return Response.json(
      {
        error:
          "Аккаунты появятся после подключения Neon в Vercel. Сейчас доступен локальный деморежим.",
      },
      { status: 503 },
    );
  try {
    await init();
    const sql = db();
    const b = await req.json();
    if (b.action === "logout") {
      const jar = await cookies();
      const token = jar.get("glade_session")?.value;
      if (token)
        await sql`DELETE FROM glade_sessions WHERE token_hash=${digest(token)}`;
      jar.delete("glade_session");
      return Response.json({ ok: true });
    }
    const email = String(b.email || "")
        .trim()
        .toLowerCase(),
      password = String(b.password || "");
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      password.length < 8 ||
      password.length > 200
    )
      return Response.json(
        { error: "Укажи email и пароль от 8 до 200 символов." },
        { status: 400 },
      );
    const key = digest(
      (req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown") +
        ":" +
        email,
    );
    const attempts =
      await sql`SELECT count(*)::int AS n FROM glade_auth_attempts WHERE key=${key} AND at>now()-interval '15 minutes'`;
    if (attempts[0].n >= 12)
      return Response.json(
        { error: "Слишком много попыток. Попробуй через 15 минут." },
        { status: 429 },
      );
    await sql`INSERT INTO glade_auth_attempts(key) VALUES(${key})`;
    await sql`DELETE FROM glade_auth_attempts WHERE at<now()-interval '1 day'`;
    if (b.action === "register") {
      const salt = randomBytes(16).toString("hex");
      const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
      const id = randomUUID();
      const rows =
        await sql`INSERT INTO glade_users(id,email,password_hash) VALUES(${id},${email},${hash}) ON CONFLICT(email) DO NOTHING RETURNING id,email`;
      if (!rows.length)
        return Response.json(
          {
            error:
              "Не удалось создать аккаунт. Попробуй войти или используй другой email.",
          },
          { status: 400 },
        );
      await session(id);
      return Response.json({ user: rows[0] });
    }
    if (b.action !== "login")
      return Response.json({ error: "Неизвестное действие" }, { status: 400 });
    const rows =
      await sql`SELECT id,email,password_hash FROM glade_users WHERE email=${email}`;
    const salt = rows[0]?.password_hash.split(":")[0] || "not-a-real-salt";
    const check = scryptSync(password, salt, 64);
    const stored = rows[0]
      ? Buffer.from(rows[0].password_hash.split(":")[1], "hex")
      : Buffer.alloc(64);
    if (!timingSafeEqual(check, stored) || !rows[0])
      return Response.json(
        { error: "Не совпали email или пароль." },
        { status: 401 },
      );
    await session(rows[0].id);
    return Response.json({ user: { id: rows[0].id, email } });
  } catch (e) {
    console.error(
      "Auth request failed",
      e instanceof Error ? e.message : "unknown",
    );
    return Response.json(
      { error: "Не удалось выполнить запрос. Проверь подключение базы." },
      { status: 500 },
    );
  }
}
