import { pingCards } from "@/lib/cards-database";

export const dynamic = "force-dynamic";

const HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET() {
  try {
    await pingCards();
    return Response.json({ ok: true }, { headers: HEADERS });
  } catch (error) {
    console.error("Archive database health check failed", error);
    return Response.json({ ok: false }, { status: 503, headers: HEADERS });
  }
}
