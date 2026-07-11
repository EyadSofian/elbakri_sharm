"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Local logging only — no external error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl px-5 py-32 text-center">
      <h1 className="text-2xl font-extrabold text-navy">حدث خطأ غير متوقع</h1>
      <p className="mt-3 text-muted">نعتذر عن ذلك. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy px-6 py-3 font-bold text-white transition hover:bg-blue"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/"
          className="rounded-full border-2 border-navy px-6 py-3 font-bold text-navy transition hover:bg-navy hover:text-white"
        >
          الرئيسية
        </Link>
      </div>
    </section>
  );
}
