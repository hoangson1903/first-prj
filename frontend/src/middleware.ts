import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.headers.get("accept")?.includes("text/html")) {
    response.headers.set("Content-Type", "text/html; charset=utf-8");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
