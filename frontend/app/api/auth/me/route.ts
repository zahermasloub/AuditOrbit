import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * API Route: GET /api/auth/me
 * يرجع بيانات المستخدم الحالي بناءً على Token
 */

const MOCK_USERS = {
  mock_admin_token: {
    id: "1",
    name: "مدير النظام",
    email: "admin@test.com",
    role: "admin" as const,
  },
  mock_manager_token: {
    id: "2",
    name: "مدير المراجعة",
    email: "manager@test.com",
    role: "manager" as const,
  },
  mock_auditor_token: {
    id: "3",
    name: "المدقق",
    email: "auditor@test.com",
    role: "auditor" as const,
  },
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const tokenFromHeader = authHeader?.replace("Bearer ", "")
    const tokenFromCookie = request.cookies.get("auth_token")?.value
    const token = tokenFromHeader || tokenFromCookie

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No token provided" },
        { status: 401 }
      )
    }

    if (token in MOCK_USERS) {
      const user = MOCK_USERS[token as keyof typeof MOCK_USERS]
      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: getPermissionsForRole(user.role),
      })
    }

    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid token" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

function getPermissionsForRole(role: "admin" | "manager" | "auditor") {
  switch (role) {
    case "admin":
      return {
        admin: { canAccess: true, canCreate: true, canEdit: true, canDelete: true },
        ops: { canAccess: true, canCreate: false, canEdit: false, canDelete: false },
        manager: { canAccess: true, canCreate: true, canEdit: true, canDelete: true },
        auditor: { canAccess: true, canCreate: false, canEdit: false, canDelete: false },
      }
    case "manager":
      return {
        admin: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        ops: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        manager: { canAccess: true, canCreate: true, canEdit: true, canDelete: true },
        auditor: { canAccess: true, canCreate: false, canEdit: false, canDelete: false },
      }
    case "auditor":
      return {
        admin: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        ops: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        manager: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        auditor: { canAccess: true, canCreate: true, canEdit: true, canDelete: false },
      }
    default:
      return {
        admin: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        ops: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        manager: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
        auditor: { canAccess: false, canCreate: false, canEdit: false, canDelete: false },
      }
  }
}
