"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Schema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(8, "كلمة المرور لا تقل عن 8 أحرف"),
});

type FormData = z.infer<typeof Schema>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(Schema) });
  const [err, setErr] = useState<string | undefined>();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setErr(undefined);
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      setErr("فشل تسجيل الدخول");
      return;
    }
    const tokens = await response.json();
    localStorage.setItem("token", tokens.access_token);
    localStorage.setItem("refresh", tokens.refresh_token);
    router.push("/admin");
  };

  return (
    <section className="max-w-md mx-auto bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow space-y-4">
      <h1 className="text-xl font-bold">تسجيل الدخول / Sign in</h1>
      <div className="text-xs bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
        <p className="font-semibold mb-1">معلومات الدخول التجريبية:</p>
        <p>Email: <code className="bg-white dark:bg-neutral-800 px-1 rounded">admin@example.com</code></p>
        <p>Password: <code className="bg-white dark:bg-neutral-800 px-1 rounded">Admin#2025</code></p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            className="w-full border rounded-xl p-2"
            placeholder="البريد / Email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          <p className="text-sm text-red-600">{errors.email?.message}</p>
        </div>
        <div>
          <input
            className="w-full border rounded-xl p-2"
            placeholder="كلمة المرور / Password"
            type="password"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <p className="text-sm text-red-600">{errors.password?.message}</p>
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
          type="submit"
        >
          {isSubmitting ? "..." : "دخول / Sign in"}
        </button>
      </form>
    </section>
  );
}
