import { NextRequest } from "next/server";
import { normalizeCardLimit, queryCards } from "@/lib/cards-database";

export const dynamic = "force-dynamic";

const RESPONSE_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  "X-Content-Type-Options": "nosniff",
};

const ERROR_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: NextRequest) {
  const limit = normalizeCardLimit(request.nextUrl.searchParams.get("limit"));

  try {
    const result = await queryCards(limit);
    return Response.json(result, { headers: RESPONSE_HEADERS });
  } catch (error) {
    console.error("Failed to query cards", error);
    return Response.json(
      { success: false, error: "The archive is temporarily unavailable." },
      { status: 503, headers: ERROR_HEADERS },
    );
  }
}
