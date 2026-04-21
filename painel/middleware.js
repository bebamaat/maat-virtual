import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authed = withAuth({ pages: { signIn: "/login" } });

export default function middleware(req) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }
  return authed(req);
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
