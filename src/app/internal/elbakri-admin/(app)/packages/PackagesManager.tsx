"use client";

import { useActionState, useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { createPackage, setPackagePublished, archivePackage, type ActionState } from "./actions";

type Dest = { id: string; name_ar: string };
type Cat = {
  id: string;
  name_ar: string;
  destination_id: string;
  is_published: boolean;
  is_archived: boolean;
  price_unit: string;
};

const UNIT_LABELS: Record<string, string> = {
  per_person_trip: "للفرد / الرحلة",
  per_person_night: "للفرد / الليلة",
  per_room_night: "للغرفة / الليلة",
  per_room_trip: "للغرفة / الرحلة",
};

function CreateForm({ destinations }: { destinations: Dest[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createPackage, {});
  return (
    <form action={action} className="mb-6 grid gap-3 rounded-2xl border border-ice bg-white p-5 md:grid-cols-2">
      <h2 className="font-bold text-navy md:col-span-2">إضافة باقة جديدة</h2>
      <label className="text-sm">
        <span className="mb-1 block font-bold text-navy">الوجهة</span>
        <select name="destination_id" required className="w-full rounded-lg border border-ice bg-white px-3 py-2 text-sm">
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name_ar}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-bold text-navy">اسم الباقة</span>
        <input name="name_ar" required className="w-full rounded-lg border border-ice bg-white px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-bold text-navy">وحدة السعر</span>
        <select name="price_unit" required className="w-full rounded-lg border border-ice bg-white px-3 py-2 text-sm">
          {Object.entries(UNIT_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-bold text-navy">ملاحظة (اختياري)</span>
        <input name="note_ar" className="w-full rounded-lg border border-ice bg-white px-3 py-2 text-sm" />
      </label>
      <div className="md:col-span-2">
        <button
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-blue disabled:opacity-60"
        >
          {state.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
          {pending ? "جارٍ الإضافة…" : state.ok ? "تمت الإضافة" : "إضافة الباقة"}
        </button>
        {state.error && (
          <span role="alert" className="mr-3 text-sm text-error">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}

function ArchiveButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded px-2 py-1 text-xs font-semibold text-error hover:bg-error/10"
      >
        أرشفة
      </button>
    );
  }
  return (
    <form action={archivePackage} className="inline-flex items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs text-muted">تأكيد؟</span>
      <button className="rounded bg-error px-2 py-1 text-xs font-bold text-white">نعم</button>
      <button type="button" onClick={() => setConfirming(false)} className="px-1 text-xs text-muted">
        لا
      </button>
    </form>
  );
}

export function PackagesManager({ destinations, categories }: { destinations: Dest[]; categories: Cat[] }) {
  const nameById = new Map(destinations.map((d) => [d.id, d.name_ar]));
  const groups = new Map<string, Cat[]>();
  for (const c of categories) {
    const key = nameById.get(c.destination_id) ?? "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }

  return (
    <div>
      <CreateForm destinations={destinations} />
      <div className="space-y-6">
        {[...groups.entries()].map(([dest, list]) => (
          <section key={dest}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-champagne-ink">{dest}</h2>
            <div className="overflow-hidden rounded-xl border border-ice bg-white">
              {list.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 border-b border-ice px-4 py-3 last:border-0"
                >
                  <span className="font-semibold text-navy">
                    {c.name_ar}
                    <span className="mr-2 text-xs font-normal text-muted">{UNIT_LABELS[c.price_unit]}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {c.is_archived ? (
                      <span className="rounded-full bg-muted/20 px-2 py-0.5 text-xs text-muted">مؤرشف</span>
                    ) : (
                      <>
                        <form action={setPackagePublished}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="publish" value={(!c.is_published).toString()} />
                          <button
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              c.is_published ? "bg-muted/20 text-navy" : "bg-success text-white"
                            }`}
                          >
                            {c.is_published ? "إلغاء النشر" : "نشر"}
                          </button>
                        </form>
                        <ArchiveButton id={c.id} />
                      </>
                    )}
                  </div>
                </div>
              ))}
              {list.length === 0 && <div className="px-4 py-3 text-sm text-muted">لا توجد باقات.</div>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
