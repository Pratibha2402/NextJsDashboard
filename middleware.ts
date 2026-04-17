import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/Dashboard");
  const isLoginRoute = req.nextUrl.pathname.startsWith("/Login");

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/Login", req.nextUrl));
  }

  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/Dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/Dashboard/:path*", "/Login"],
};
