import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * API Route: POST /api/auth/login
 * تسجيل دخول المستخدم
 */

const MOCK_CREDENTIALS = {
  "admin@test.com": {
    password: "admin123",
    token: "mock_admin_token",
    user: {
      id: "1",
      name: "مدير النظام",
      email: "admin@test.com",
      role: "admin" as const,
    },
  },
  "manager@test.com": {
    password: "manager123",
    token: "mock_manager_token",
    user: {
      id: "2",
      name: "مدير المراجعة",
      email: "manager@test.com",
      role: "manager" as const,
    },
  },
  "auditor@test.com": {
    password: "auditor123",
    token: "mock_auditor_token",
    user: {
      id: "3",
      name: "المدقق",
      email: "auditor@test.com",
      role: "auditor" as const,
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Bad Request", message: "Email and password required" },
        { status: 400 }
      )
    }

    const mockUser = MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS]
    
    if (!mockUser || mockUser.password !== password) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      token: mockUser.token,
      user: {
        ...mockUser.user,
        permissions: getPermissionsForRole(mockUser.user.role),
      },
    })

    response.cookies.set("auth_token", mockUser.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in /api/auth/login:", error)
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
