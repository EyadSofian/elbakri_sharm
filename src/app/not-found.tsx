import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-32 text-center">
      <div className="text-6xl font-black text-navy" dir="ltr">
        404
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-navy">الصفحة غير موجودة</h1>
      <p className="mt-3 text-muted">عذرًا، لا يمكننا العثور على الصفحة التي تبحث عنها.</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-bold text-white transition hover:bg-blue"
      >
        العودة للرئيسية
      </Link>
    </section>
  );
}
