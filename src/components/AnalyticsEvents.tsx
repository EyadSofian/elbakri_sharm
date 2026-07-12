"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function pushDataLayer(event: string, details: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...details });
}

/** Tracks App Router navigation and the site's highest-value conversion clicks. */
export function AnalyticsEvents() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current === null) {
      previousPath.current = pathname;
      return;
    }
    if (pathname === previousPath.current) return;
    window.fbq?.("track", "PageView");
    pushDataLayer("virtual_page_view", { page_path: pathname });
    previousPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const trackConversion = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.href;
      if (href.includes("wa.me/")) {
        window.fbq?.("track", "Lead", { content_name: "WhatsApp" });
        pushDataLayer("whatsapp_click", { link_url: href });
      } else if (href.startsWith("tel:")) {
        window.fbq?.("track", "Contact", { content_name: "Phone" });
        pushDataLayer("phone_click", { link_url: href });
      } else if (href.includes("/checkout")) {
        window.fbq?.("track", "InitiateCheckout");
        pushDataLayer("begin_checkout", { link_url: href });
      } else if (link.hash === "#destinations") {
        window.fbq?.("track", "ViewContent", { content_name: "Offers" });
        pushDataLayer("view_offers_click");
      }
    };

    document.addEventListener("click", trackConversion, { capture: true });
    return () => document.removeEventListener("click", trackConversion, { capture: true });
  }, []);

  return null;
}
