import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/v1/cards";
  return Response.redirect(url, 308);
}
