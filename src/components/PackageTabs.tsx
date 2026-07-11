"use client";

import type { CategoryView } from "@/lib/catalog";

export function PackageTabs({
  categories,
  active,
  onChange,
}: {
  categories: CategoryView[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="الباقات المتاحة"
      className="mobile-snap flex gap-2 overflow-x-auto pb-1"
    >
      {categories.map((c) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.id)}
            className={`tap-target shrink-0 rounded-full border px-4 text-sm font-extrabold transition active:scale-[0.98] ${
              on
                ? "border-navy bg-navy text-white shadow-card"
                : "border-ice bg-white text-navy/75 hover:border-navy/25 hover:bg-mist"
            }`}
          >
            {c.name}
            <span className={`mr-1.5 text-[10px] ${on ? "text-white/65" : "text-muted"}`}>
              {c.hotelSlugs.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
