"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api/env";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const getRedirect = () => {
    if (typeof window === "undefined") return null;
    const sp = new URLSearchParams(window.location.search);
    return sp.get("redirect");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "فشل تسجيل الدخول");
      }
  const tokens = await res.json();
      localStorage.setItem("token", tokens.access_token);
      if (tokens.refresh_token) localStorage.setItem("refresh", tokens.refresh_token);
      document.cookie = `token=${tokens.access_token}; path=/; max-age=86400; SameSite=Lax`;
  const redirect = getRedirect() || "/admin";
      router.push(redirect);
    } catch (err: any) {
      setError(err?.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto bg-[rgb(var(--surface))] p-6 rounded-2xl shadow-soft border border-[rgb(var(--border))] space-y-4">
      <h1 className="text-xl font-bold">تسجيل الدخول / Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <input
            className="w-full border border-[rgb(var(--border))] bg-transparent rounded-xl p-2"
            placeholder="البريد / Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
          />
        </div>
        <div>
          <input
            className="w-full border border-[rgb(var(--border))] bg-transparent rounded-xl p-2"
            placeholder="كلمة المرور / Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))] text-white disabled:opacity-60"
          type="submit"
        >
          {loading ? "..." : "دخول / Sign in"}
        </button>
      </form>
    </section>
  );
}
