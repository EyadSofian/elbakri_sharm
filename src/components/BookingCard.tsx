import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { whatsappHref, telHref } from "@/lib/whatsapp";
import { Price } from "@/components/Price";

export function BookingCard({
  hotelName,
  minPrice,
  unitLabel,
  contextLine,
  whatsapp,
  phone,
}: {
  hotelName: string;
  minPrice: number | null;
  unitLabel?: string;
  contextLine?: string;
  whatsapp?: string;
  phone?: string;
}) {
  const msg =
    "مرحباً، أرغب في حجز " +
    hotelName +
    (contextLine ? " — " + contextLine : "") +
    " عبر البكري أوفرسيز";

  return (
    <aside className="overflow-hidden rounded-[24px] border border-ice bg-white shadow-glass lg:sticky lg:top-24">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="text-xs font-extrabold text-champagne">جاهز للحجز؟</div>
        <div className="mt-1 text-sm text-white/70">السعر يبدأ من</div>
        <div className="mt-1 text-4xl font-black leading-none text-white">
          <Price value={minPrice} />
          <span className="mr-1 text-sm font-semibold text-white/65">ج.م</span>
        </div>
        {unitLabel ? <div className="mt-2 text-xs text-white/60">{unitLabel}</div> : null}
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-5 space-y-2 text-xs font-semibold text-muted">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
            مراجعة السعر والتوافر قبل التأكيد
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
            تواصل مباشر مع فريق الحجز
          </div>
        </div>

        <a
          href={whatsappHref(msg, whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="tap-target inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-whatsapp px-5 font-extrabold text-white transition hover:brightness-105 active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          احجز الآن عبر واتساب
        </a>
        <a
          href={telHref(phone)}
          className="tap-target mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[15px] border-2 border-navy px-5 font-extrabold text-navy transition hover:bg-navy hover:text-white active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" aria-hidden />
          اتصال مباشر
        </a>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          الأسعار والتوافر تتطلب تأكيدًا نهائيًا من فريقنا.
        </p>
      </div>
    </aside>
  );
}
