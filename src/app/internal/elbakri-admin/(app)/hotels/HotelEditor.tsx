"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Save, CheckCircle2, ExternalLink } from "lucide-react";
import { updatePricePeriod, setHotelPublished, type ActionState } from "./actions";

export type Period = {
  id: string;
  period_label: string;
  board_ar: string | null;
  double_text: string | null;
  triple_text: string | null;
};
export type EditorHotel = {
  id: string;
  slug: string;
  name_ar: string;
  is_published: boolean;
  unit_label: string;
};

function Field({
  name,
  label,
  defaultValue,
  dir,
}: {
  name: string;
  label: string;
  defaultValue: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-bold text-navy">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        dir={dir}
        className={`${dir === "ltr" ? "ltr " : ""}w-full rounded-md border border-ice bg-white px-2 py-1.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20`}
      />
    </label>
  );
}

function PriceRow({ hotelSlug, p }: { hotelSlug: string; p: Period }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePricePeriod, {});
  return (
    <form
      action={action}
      className="grid grid-cols-2 gap-2 rounded-lg border border-ice p-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end"
    >
      <input type="hidden" name="id" value={p.id} />
      <input type="hidden" name="hotelSlug" value={hotelSlug} />
      <Field name="period_label" label="الفترة" defaultValue={p.period_label} dir="ltr" />
      <Field name="board_ar" label="الإقامة" defaultValue={p.board_ar ?? ""} />
      <Field name="double_text" label="مزدوجة" defaultValue={p.double_text ?? ""} dir="ltr" />
      <Field name="triple_text" label="ثلاثية" defaultValue={p.triple_text ?? ""} dir="ltr" />
      <button
        disabled={pending}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-blue disabled:opacity-60"
      >
        {state.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
        {pending ? "..." : state.ok ? "تم" : "حفظ"}
      </button>
      {state.error && (
        <p role="alert" className="col-span-2 text-xs text-error md:col-span-5">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function HotelEditor({ hotel, periods }: { hotel: EditorHotel; periods: Period[] }) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{hotel.name_ar}</h1>
          <p className="text-sm text-muted">الأسعار {hotel.unit_label}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/hotels/${hotel.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-lg border border-ice px-3 py-2 text-sm font-semibold text-navy hover:bg-mist"
          >
            <ExternalLink className="h-4 w-4" aria-hidden /> معاينة عامة
          </Link>
          <form action={setHotelPublished}>
            <input type="hidden" name="id" value={hotel.id} />
            <input type="hidden" name="hotelSlug" value={hotel.slug} />
            <input type="hidden" name="publish" value={(!hotel.is_published).toString()} />
            <button
              className={`rounded-lg px-3 py-2 text-sm font-bold ${
                hotel.is_published ? "bg-muted/20 text-navy" : "bg-success text-white"
              }`}
            >
              {hotel.is_published ? "إلغاء النشر" : "نشر"}
            </button>
          </form>
        </div>
      </div>

      <h2 className="mb-3 font-bold text-navy">فترات الأسعار</h2>
      <div className="space-y-2">
        {periods.map((p) => (
          <PriceRow key={p.id} hotelSlug={hotel.slug} p={p} />
        ))}
        {periods.length === 0 && <p className="text-sm text-muted">لا توجد فترات.</p>}
      </div>
    </div>
  );
}
