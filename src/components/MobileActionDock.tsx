import { MessageCircle, Phone } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/whatsapp";

export function MobileActionDock({
  whatsapp,
  phone,
  message,
}: {
  whatsapp?: string;
  phone?: string;
  message: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] md:hidden">
      <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-[1fr_54px] gap-2 rounded-[20px] border border-white/30 bg-midnight/92 p-2 shadow-glass backdrop-blur-xl">
        <a
          href={whatsappHref(message, whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="tap-target inline-flex items-center justify-center gap-2 rounded-[14px] bg-whatsapp px-4 py-3 text-sm font-extrabold text-white shadow-lg transition active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          احجز عبر واتساب
        </a>
        <a
          href={telHref(phone)}
          aria-label="اتصال مباشر"
          className="tap-target grid place-items-center rounded-[14px] border border-white/20 bg-white/10 text-white transition active:scale-[0.96]"
        >
          <Phone className="h-5 w-5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
