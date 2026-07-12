"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { ChevronDown, Menu, MessageCircle, X } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/Logo";
import { whatsappHref } from "@/lib/whatsapp";

type NavDestination = { slug: string; name: string };

export function Navbar({
  destinations,
  whatsapp,
  whatsappMessage,
}: {
  destinations: NavDestination[];
  whatsapp?: string;
  whatsappMessage: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDestOpen(false);
  }, [pathname]);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const desktopLink =
    "tap-target relative inline-flex items-center px-1 text-sm font-bold text-navy/75 transition-colors hover:text-navy after:absolute after:inset-x-1 after:bottom-1 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-champagne after:transition-transform hover:after:scale-x-100";

  return (
    <LazyMotion features={domAnimation} strict>
      <header
        className={clsx(
          "sticky top-0 z-50 w-full border-b border-ice/80 bg-white/94 pt-[env(safe-area-inset-top)] backdrop-blur-xl transition-shadow",
          scrolled && "shadow-card",
        )}
      >
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[76px]">
          <Link
            href="/"
            aria-label="البكري أوفرسيز — الصفحة الرئيسية"
            className="tap-target absolute left-1/2 top-1/2 flex max-w-[55%] -translate-x-1/2 -translate-y-1/2 items-center lg:static lg:max-w-none lg:translate-x-0 lg:translate-y-0"
          >
            <Logo priority className="h-8 sm:h-9 lg:h-11" />
          </Link>

          {/* Mobile quick-contact (balances the row against the menu button) */}
          <a
            href={whatsappHref(whatsappMessage, whatsapp)}
            target="_blank"
            rel="noreferrer"
            aria-label="تواصل عبر واتساب"
            className="tap-target grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-whatsapp text-white shadow-sm transition active:scale-95 lg:hidden"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
          </a>

          <nav aria-label="التنقل الرئيسي" className="mx-auto hidden items-center gap-5 lg:flex xl:gap-7">
            <Link
              href="/"
              className={clsx(desktopLink, active("/") && "text-navy after:scale-x-100")}
            >
              الرئيسية
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setDestOpen(true)}
              onMouseLeave={() => setDestOpen(false)}
            >
              <button
                type="button"
                className={clsx(desktopLink, "gap-1")}
                aria-expanded={destOpen}
                aria-haspopup="menu"
                onClick={() => setDestOpen((value) => !value)}
              >
                الوجهات
                <ChevronDown
                  className={clsx("h-4 w-4 transition-transform", destOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
              <AnimatePresence>
                {destOpen ? (
                  <m.div
                    role="menu"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full w-64 overflow-hidden rounded-[20px] border border-ice bg-white p-2 shadow-glass"
                  >
                    {destinations.map((destination) => (
                      <Link
                        key={destination.slug}
                        href={"/destinations/" + destination.slug}
                        role="menuitem"
                        className="tap-target flex items-center justify-between rounded-xl px-4 text-sm font-bold text-navy transition hover:bg-mist"
                      >
                        {destination.name}
                        <span className="text-champagne" aria-hidden>
                          ←
                        </span>
                      </Link>
                    ))}
                  </m.div>
                ) : null}
              </AnimatePresence>
            </div>

            <Link href="/#destinations" className={desktopLink}>
              عروض الفنادق
            </Link>
            <Link
              href="/honeymoon"
              className={clsx(desktopLink, active("/honeymoon") && "text-navy after:scale-x-100")}
            >
              شهر العسل
            </Link>
            <Link
              href="/about"
              className={clsx(desktopLink, active("/about") && "text-navy after:scale-x-100")}
            >
              من نحن
            </Link>
            <Link
              href="/contact"
              className={clsx(desktopLink, active("/contact") && "text-navy after:scale-x-100")}
            >
              تواصل معنا
            </Link>
          </nav>

          <a
            href={whatsappHref(whatsappMessage, whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="tap-target hidden shrink-0 items-center gap-2 rounded-full bg-navy px-5 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-blue active:scale-[0.98] lg:inline-flex"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            احجز الآن
          </a>

          <button
            type="button"
            className="tap-target grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-ice bg-white text-navy shadow-sm transition active:scale-95 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>

        <AnimatePresence>
          {open ? (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-full max-h-[calc(100svh-64px)] overflow-y-auto border-t border-ice bg-white p-4 shadow-glass lg:hidden"
            >
              <nav aria-label="التنقل على الهاتف" className="mx-auto max-w-lg">
                <Link href="/" className="tap-target flex items-center rounded-xl px-4 font-bold text-navy hover:bg-mist">
                  الرئيسية
                </Link>
                <div className="mt-2 px-4 py-2 text-xs font-extrabold text-champagne-ink">الوجهات</div>
                <div className="grid grid-cols-2 gap-2">
                  {destinations.map((destination) => (
                    <Link
                      key={destination.slug}
                      href={"/destinations/" + destination.slug}
                      className="tap-target flex items-center justify-center rounded-xl border border-ice bg-mist px-3 text-center text-sm font-bold text-navy"
                    >
                      {destination.name}
                    </Link>
                  ))}
                </div>
                <div className="my-3 h-px bg-ice" />
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/honeymoon" className="tap-target flex items-center rounded-xl px-4 font-bold text-navy hover:bg-mist">
                    شهر العسل
                  </Link>
                  <Link href="/about" className="tap-target flex items-center rounded-xl px-4 font-bold text-navy hover:bg-mist">
                    من نحن
                  </Link>
                  <Link href="/contact" className="tap-target flex items-center rounded-xl px-4 font-bold text-navy hover:bg-mist">
                    تواصل معنا
                  </Link>
                  <Link href="/#destinations" className="tap-target flex items-center rounded-xl px-4 font-bold text-navy hover:bg-mist">
                    كل العروض
                  </Link>
                </div>
                <a
                  href={whatsappHref(whatsappMessage, whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="tap-target mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-whatsapp px-5 text-sm font-extrabold text-white"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  تواصل واحجز عبر واتساب
                </a>
              </nav>
            </m.div>
          ) : null}
        </AnimatePresence>
      </header>
    </LazyMotion>
  );
}
