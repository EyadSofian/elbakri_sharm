import { MessageCircle } from "lucide-react";
import { whatsappHref, DEFAULT_WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/whatsapp";

/** Persistent WhatsApp action (bottom-start for RTL) with a descriptive name. */
export function FloatingWhatsApp({
  whatsapp = WHATSAPP_NUMBER,
  message = DEFAULT_WHATSAPP_MESSAGE,
}: {
  whatsapp?: string;
  message?: string;
}) {
  return (
    <a
      href={whatsappHref(message, whatsapp)}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-5 left-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-glass transition hover:brightness-95 focus-visible:outline-champagne"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
