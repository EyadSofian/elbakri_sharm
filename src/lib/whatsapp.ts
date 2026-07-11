import { CONTACT_PHONE, CONTACT_WHATSAPP } from "@/lib/catalog";

export const WHATSAPP_NUMBER = CONTACT_WHATSAPP;
export const PHONE_DISPLAY = CONTACT_PHONE;
/** tel: href, digits + leading "+": "+20 12 25279820" -> "tel:+201225279820" */
export const TEL_HREF = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`;

export function whatsappHref(message: string, number: string = CONTACT_WHATSAPP): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** tel: href for an arbitrary display number (digits + leading +). */
export function telHref(phone: string = CONTACT_PHONE): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export const DEFAULT_WHATSAPP_MESSAGE = "مرحباً، أود الاستفسار عن عروض البكري أوفرسيز";
