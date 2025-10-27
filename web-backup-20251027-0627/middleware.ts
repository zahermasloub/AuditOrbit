import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware لحماية صفحات /admin و /manager
 * يتحقق من وجود token في cookies
 * إذا لم يكن موجود، يعيد التوجيه لصفحة تسجيل الدخول
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // إذا كان المستخدم يحاول الوصول لصفحات محمية بدون token
  if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/manager"))) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*"],
};
