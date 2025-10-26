import { api, safeCall } from "./client";

// Annual Planning API endpoints
// Note: These require backend to be running and types.gen.ts to be generated
// Run: npm run api:gen (requires backend running on localhost:8000)

export async function submitAnnualPlan(planId: string) {
  // @ts-ignore - types will be generated from OpenAPI
  return safeCall(api.POST("/api/v1/annual-plans/{plan_id}/submit", { 
    params: { path: { plan_id: planId } } 
  }));
}

export async function approveAnnualPlan(planId: string, step: "manager"|"cae"|"committee", notes?: string) {
  // @ts-ignore - types will be generated from OpenAPI
  return safeCall(api.POST("/api/v1/annual-plans/{plan_id}/approve", {
    params: { path: { plan_id: planId }, query: { step, notes } }
  }));
}

export async function publishAnnualPlan(planId: string) {
  // @ts-ignore - types will be generated from OpenAPI
  return safeCall(api.POST("/api/v1/annual-plans/{plan_id}/publish", { 
    params: { path: { plan_id: planId } } 
  }));
}

// Health check endpoint (for testing)
export async function getHealthCheck() {
  return api.GET("/health");
}

