"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

type Form = { name: string; email: string; mobile: string };

export function CheckoutForm({ hotelSlug }: { hotelSlug: string }) {
  const [form, setForm] = useState<Form>({ name: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelSlug, ...form }),
      });
      const data = (await res.json().catch(() => null)) as
        | { redirectUrl?: string; message?: string }
        | null;
      if (!res.ok || !data?.redirectUrl) {
        throw new Error(data?.message ?? "تعذّر بدء الدفع. برجاء المحاولة مرة أخرى.");
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-[14px] border border-ice bg-white px-4 py-3 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/15";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="ck-name" className="mb-1.5 block text-sm font-bold text-navy">
          الاسم بالكامل
        </label>
        <input
          id="ck-name"
          name="name"
          required
          autoComplete="name"
          value={form.name}
          onChange={update("name")}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="ck-email" className="mb-1.5 block text-sm font-bold text-navy">
          البريد الإلكتروني
        </label>
        <input
          id="ck-email"
          name="email"
          type="email"
          inputMode="email"
          dir="ltr"
          required
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          className={`${field} text-right`}
        />
      </div>

      <div>
        <label htmlFor="ck-mobile" className="mb-1.5 block text-sm font-bold text-navy">
          رقم الموبايل
        </label>
        <input
          id="ck-mobile"
          name="mobile"
          type="tel"
          inputMode="tel"
          dir="ltr"
          required
          autoComplete="tel"
          placeholder="01xxxxxxxxx"
          value={form.mobile}
          onChange={update("mobile")}
          className={`${field} text-right`}
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="tap-target inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-navy px-5 font-extrabold text-white transition hover:bg-blue active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <ShieldCheck className="h-5 w-5" aria-hidden />
        )}
        {loading ? "جارٍ التحويل للدفع الآمن…" : "المتابعة للدفع الآمن"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
        دفع آمن عبر EasyKash — بطاقات، محافظ، وتقسيط.
      </p>
    </form>
  );
}
