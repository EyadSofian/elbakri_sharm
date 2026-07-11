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
    <div role="tablist" aria-label="الباقات المتاحة" className="flex flex-wrap gap-2 border-b border-ice">
      {categories.map((c) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.id)}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              on
                ? "border-champagne bg-navy text-white"
                : "border-transparent text-navy/75 hover:bg-mist"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
