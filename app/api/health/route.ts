import { configured } from "@/lib/db";
export async function GET() {
  return Response.json({ databaseConfigured: configured() });
}
