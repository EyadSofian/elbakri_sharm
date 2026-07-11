import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة تحكم — البكري أوفرسيز",
  robots: { index: false, follow: false, nocache: true },
};

// Force dynamic — the admin is per-request and must never be cached/prerendered.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-mist text-navy">{children}</div>;
}
