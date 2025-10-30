import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * API Route: POST /api/auth/logout
 * تسجيل خروج المستخدم
 */

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    response.cookies.delete("auth_token")

    return response
  } catch (error) {
    console.error("Error in /api/auth/logout:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
