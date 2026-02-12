import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect /dashboard routes (allow both admin and user)
  if (pathname.startsWith("/admin")) {
    if (!token || !["admin"].includes(token.role as string)) {
      const url = new URL("/auth/login", request.url);

      return NextResponse.redirect(url);
    }
  }
  

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", ],
};
