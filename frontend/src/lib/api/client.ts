import createClient from "openapi-fetch";
import type { paths } from "./types.gen";
import { API_BASE_URL } from "./env";

export type ApiPaths = paths;
export const api = createClient<paths>({ baseUrl: API_BASE_URL });

export async function safeCall<T>(p: Promise<{ data?: T; error?: any; response: Response }>) {
  const { data, error, response } = await p;
  if (error) {
    const detail = (error as any)?.detail ?? (await response?.text()?.catch(()=> "")) ?? "Unknown error";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as T;
}

