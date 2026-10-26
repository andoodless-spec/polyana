import { neon } from "@neondatabase/serverless";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
export const configured = () => !!process.env.DATABASE_URL;
export function db() {
  if (!configured()) throw Error("DATABASE_NOT_CONFIGURED");
  return neon(process.env.DATABASE_URL!);
}
let initialized: Promise<void> | undefined;
export function init() {
  return (initialized ||= (async () => {
    const sql = db();
    await sql`CREATE TABLE IF NOT EXISTS glade_users (id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS glade_sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES glade_users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL)`;
    await sql`CREATE TABLE IF NOT EXISTS glade_state (user_id uuid PRIMARY KEY REFERENCES glade_users(id) ON DELETE CASCADE, data jsonb NOT NULL DEFAULT '{}', version integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS glade_auth_attempts (key text NOT NULL, at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE INDEX IF NOT EXISTS glade_auth_attempts_key_at ON glade_auth_attempts(key, at)`;
  })().catch((e) => {
    initialized = undefined;
    throw e;
  }));
}
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export async function user() {
  const token = (await cookies()).get("glade_session")?.value;
  if (!token || !configured()) return null;
  await init();
  const sql = db();
  const rows =
    await sql`SELECT u.id,u.email FROM glade_sessions s JOIN glade_users u ON u.id=s.user_id WHERE s.token_hash=${digest(token)} AND s.expires_at>now()`;
  return rows[0] || null;
}
export async function session(id: string) {
  const token = randomBytes(32).toString("hex");
  const sql = db();
  await sql`INSERT INTO glade_sessions(token_hash,user_id,expires_at) VALUES (${digest(token)},${id},now()+interval '30 days')`;
  (await cookies()).set("glade_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 2592000,
  });
}
export function validOrigin(req: Request) {
  const o = req.headers.get("origin");
  if (req.headers.get("sec-fetch-site") === "cross-site") return false;
  if (!o) return true;
  try {
    return (
      new URL(o).host ===
      (req.headers.get("x-forwarded-host") || req.headers.get("host"))
    );
  } catch {
    return false;
  }
}
