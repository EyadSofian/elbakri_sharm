import { MessageCircle, Phone } from "lucide-react";
import { whatsappHref, TEL_HREF } from "@/lib/whatsapp";
import { Price } from "@/components/Price";

export function BookingCard({
  hotelName,
  minPrice,
  unitLabel,
  contextLine,
}: {
  hotelName: string;
  minPrice: number | null;
  unitLabel?: string;
  contextLine?: string;
}) {
  const msg = `مرحباً، أرغب في حجز ${hotelName}${contextLine ? ` — ${contextLine}` : ""} عبر البكري أوفرسيز`;

  return (
    <aside className="sticky top-24 rounded-[22px] border border-ice bg-white p-6 shadow-glass">
      <div className="text-xs text-muted">تبدأ من</div>
      <div className="mb-1 text-4xl font-black leading-none text-navy">
        <Price value={minPrice} />
        <span className="mr-1 text-sm font-semibold text-muted">ج.م</span>
      </div>
      {unitLabel && <div className="mb-5 text-xs text-muted">{unitLabel}</div>}

      <a
        href={whatsappHref(msg)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 font-bold text-white transition hover:brightness-95"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        احجز الآن عبر واتساب
      </a>
      <a
        href={TEL_HREF}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy px-5 py-3 font-bold text-navy transition hover:bg-navy hover:text-white"
      >
        <Phone className="h-4 w-4" aria-hidden />
        اتصال مباشر
      </a>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
        الأسعار والتوافر تتطلب تأكيدًا نهائيًا من فريقنا قبل إتمام الحجز.
      </p>
    </aside>
  );
}
