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
      className="tap-target fixed bottom-5 left-5 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-glass transition hover:-translate-y-1 hover:brightness-105 focus-visible:outline-champagne md:inline-flex"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
