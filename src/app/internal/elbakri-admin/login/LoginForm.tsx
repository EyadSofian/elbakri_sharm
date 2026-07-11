"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { signIn, type SignInState } from "./actions";

export function LoginForm({
  redirectTo,
  configured,
}: {
  redirectTo: string;
  configured: boolean;
}) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={formAction} className="space-y-4">
      {!configured && (
        <p className="flex items-start gap-2 rounded-lg bg-champagne/15 p-3 text-xs text-navy">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden />
          لوحة التحكم غير مفعّلة — يلزم إعداد Supabase (متغيرات البيئة).
        </p>
      )}
      <input type="hidden" name="redirect" value={redirectTo} />

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-bold text-navy">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          dir="ltr"
          className="ltr w-full rounded-lg border border-ice bg-white px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-bold text-navy">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-ice bg-white px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
      </div>

      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !configured}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 font-bold text-white transition hover:bg-blue disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        {pending ? "جارٍ الدخول…" : "تسجيل الدخول"}
      </button>
    </form>
  );
}
