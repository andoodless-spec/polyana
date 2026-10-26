import { validBackup } from "@/lib/data";
import { db, user, validOrigin } from "@/lib/db";
export const runtime = "nodejs";
export async function GET() {
  try {
    const u = await user();
    if (!u) return Response.json({ error: "Войди в аккаунт" }, { status: 401 });
    const sql = db();
    const rows =
      await sql`SELECT data,version FROM glade_state WHERE user_id=${u.id}`;
    return Response.json(rows[0] || { data: null, version: 0 }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Не удалось загрузить данные" },
      { status: 503 },
    );
  }
}
export async function PUT(req: Request) {
  if (!validOrigin(req))
    return Response.json({ error: "Недопустимый источник" }, { status: 403 });
  try {
    const u = await user();
    if (!u) return Response.json({ error: "Войди в аккаунт" }, { status: 401 });
    const text = await req.text();
    if (Buffer.byteLength(text) > 3_500_000)
      return Response.json(
        { error: "Резервная копия слишком велика. Уменьши размер фотографий." },
        { status: 413 },
      );
    const b = JSON.parse(text);
    if (!validBackup(b.data) || !Number.isInteger(b.version))
      return Response.json(
        { error: "Неверный формат данных" },
        { status: 400 },
      );
    const sql = db();
    await sql`INSERT INTO glade_state(user_id) VALUES(${u.id}) ON CONFLICT DO NOTHING`;
    const rows =
      await sql`UPDATE glade_state SET data=${JSON.stringify(b.data)}::jsonb,version=version+1,updated_at=now() WHERE user_id=${u.id} AND version=${b.version} RETURNING version`;
    if (!rows.length)
      return Response.json(
        {
          error:
            "На другом устройстве появились изменения. Сохрани резервную копию текущих правок и загрузи облачную версию.",
        },
        { status: 409 },
      );
    return Response.json({ version: rows[0].version });
  } catch {
    return Response.json(
      {
        error:
          "Не удалось сохранить. Локальная копия осталась на этом устройстве.",
      },
      { status: 503 },
    );
  }
}
