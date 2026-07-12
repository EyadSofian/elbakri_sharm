import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "حالة الحجز", robots: { index: false } };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const status = (sp.Status ?? sp.status ?? "").toUpperCase();
  const reference = sp.customerReference ?? sp.providerRefNum ?? null;
  const paid = status === "PAID" || status === "SUCCESS";

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
      {paid ? (
        <>
          <CheckCircle2 className="h-16 w-16 text-success" aria-hidden />
          <h1 className="mt-4 text-2xl font-black text-navy sm:text-3xl">تم استلام دفعتك بنجاح</h1>
          <p className="mt-3 leading-relaxed text-navy/80">
            شكرًا لك! سيتواصل معك فريق البكري أوفرسيز لتأكيد تفاصيل حجزك في أقرب وقت.
          </p>
        </>
      ) : (
        <>
          <Clock className="h-16 w-16 text-champagne" aria-hidden />
          <h1 className="mt-4 text-2xl font-black text-navy sm:text-3xl">جارٍ تأكيد عملية الدفع</h1>
          <p className="mt-3 leading-relaxed text-navy/80">
            إذا أتممت الدفع فسنؤكد حجزك فور استلام الإشعار. إذا واجهت أي مشكلة برجاء التواصل معنا.
          </p>
        </>
      )}

      {reference ? (
        <p className="mt-2 text-xs text-muted">
          رقم المرجع: <span className="ltr font-semibold">{reference}</span>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="tap-target inline-flex min-h-[48px] items-center rounded-[14px] bg-navy px-6 font-extrabold text-white transition hover:bg-blue"
        >
          الصفحة الرئيسية
        </Link>
        <Link
          href="/#destinations"
          className="tap-target inline-flex min-h-[48px] items-center rounded-[14px] border-2 border-navy px-6 font-extrabold text-navy transition hover:bg-navy hover:text-white"
        >
          تصفّح العروض
        </Link>
      </div>
    </section>
  );
}
