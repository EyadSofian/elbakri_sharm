"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/Logo";

type NavDestination = { slug: string; name: string };

export function Navbar({ destinations }: { destinations: NavDestination[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setDestOpen(false);
  }, [pathname]);

  const link = "text-sm font-semibold text-navy/85 hover:text-navy transition-colors";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 w-full glass rounded-none border-x-0 border-t-0 transition-shadow ${
        scrolled ? "shadow-glass" : "shadow-none"
      }`}
    >
      <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between gap-4 px-5 md:h-[76px]">
        <Link href="/" aria-label="البكري أوفرسيز — الصفحة الرئيسية" className="shrink-0">
          <Logo priority className="h-10 md:h-12" />
        </Link>

        <nav aria-label="التنقل الرئيسي" className="mx-auto hidden items-center gap-7 lg:flex">
          <Link href="/" className={`${link} ${pathname === "/" ? "text-navy" : ""}`}>
            الرئيسية
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setDestOpen(true)}
            onMouseLeave={() => setDestOpen(false)}
          >
            <button
              type="button"
              className={`${link} inline-flex items-center gap-1`}
              aria-expanded={destOpen}
              aria-haspopup="true"
              onClick={() => setDestOpen((v) => !v)}
            >
              الوجهات <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
            {destOpen && (
              <div className="absolute right-0 top-full mt-1 w-60 overflow-hidden rounded-2xl border border-ice bg-white shadow-glass">
                {destinations.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/destinations/${d.slug}`}
                    className="block px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/#destinations" className={link}>
            عروض الفنادق
          </Link>
          <Link href="/honeymoon" className={`${link} ${isActive("/honeymoon") ? "text-navy" : ""}`}>
            شهر العسل
          </Link>
          <Link href="/about" className={`${link} ${isActive("/about") ? "text-navy" : ""}`}>
            من نحن
          </Link>
          <Link href="/contact" className={`${link} ${isActive("/contact") ? "text-navy" : ""}`}>
            تواصل معنا
          </Link>
        </nav>

        <Link
          href="/#destinations"
          className="hidden shrink-0 rounded-full bg-navy px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue md:inline-flex"
        >
          استعرض العروض
        </Link>

        <button
          type="button"
          className="rounded-md p-2 text-navy lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ice bg-white lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
            <Link href="/" className="rounded-md px-2 py-2.5 font-semibold hover:bg-mist">
              الرئيسية
            </Link>
            <div className="px-2 py-2 text-xs uppercase tracking-wider text-muted">الوجهات</div>
            {destinations.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="rounded-md px-4 py-2 text-sm hover:bg-mist"
              >
                {d.name}
              </Link>
            ))}
            <Link href="/#destinations" className="rounded-md px-2 py-2.5 font-semibold hover:bg-mist">
              عروض الفنادق
            </Link>
            <Link href="/honeymoon" className="rounded-md px-2 py-2.5 font-semibold hover:bg-mist">
              شهر العسل
            </Link>
            <Link href="/about" className="rounded-md px-2 py-2.5 font-semibold hover:bg-mist">
              من نحن
            </Link>
            <Link href="/contact" className="rounded-md px-2 py-2.5 font-semibold hover:bg-mist">
              تواصل معنا
            </Link>
            <Link
              href="/#destinations"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white"
            >
              استعرض العروض
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
