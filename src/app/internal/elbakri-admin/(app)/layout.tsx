import Link from "next/link";
import {
  LayoutDashboard,
  MapPin,
  Package,
  Building2,
  Heart,
  Settings,
  ScrollText,
  LogOut,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { Logo } from "@/components/Logo";
import { signOut } from "../login/actions";

const BASE = "/internal/elbakri-admin";
const NAV = [
  { href: BASE, label: "لوحة المعلومات", icon: LayoutDashboard },
  { href: `${BASE}/destinations`, label: "الوجهات", icon: MapPin },
  { href: `${BASE}/packages`, label: "الباقات", icon: Package },
  { href: `${BASE}/hotels`, label: "الفنادق والأسعار", icon: Building2 },
  { href: `${BASE}/honeymoon`, label: "شهر العسل", icon: Heart },
  { href: `${BASE}/settings`, label: "الإعدادات", icon: Settings },
  { href: `${BASE}/audit`, label: "السجل", icon: ScrollText },
];

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy transition hover:bg-mist"
        >
          <n.icon className="h-4 w-4 shrink-0 text-blue" aria-hidden />
          {n.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-l border-ice bg-white md:flex">
        <div className="border-b border-ice p-4">
          <Logo className="h-8" />
        </div>
        <div className="flex flex-1 flex-col p-3">{nav}</div>
        <form action={signOut} className="border-t border-ice p-3">
          <div className="mb-2 truncate px-2 text-xs text-muted" dir="ltr">
            {profile.email}
          </div>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-error transition hover:bg-error/10">
            <LogOut className="h-4 w-4" aria-hidden />
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ice bg-white px-4 py-3 md:hidden">
          <Logo className="h-7" />
          <form action={signOut}>
            <button className="flex items-center gap-1 text-sm font-semibold text-error">
              <LogOut className="h-4 w-4" aria-hidden /> خروج
            </button>
          </form>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-ice bg-white px-3 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-navy hover:bg-mist"
            >
              {n.label}
            </Link>
          ))}
        </div>
        <main className="mx-auto max-w-5xl p-5">{children}</main>
      </div>
    </div>
  );
}
