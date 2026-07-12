"use client";

import { useMemo, useState } from "react";
import {
  Baby,
  BedDouble,
  CalendarDays,
  Loader2,
  MessageCircle,
  Minus,
  Moon,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { PricePeriod } from "@/lib/catalog";
import {
  availableOccupancies,
  computeBreakdown,
  hasChildPricing,
  isPerNight,
  type Occupancy,
} from "@/lib/booking/pricing";
import { formatPrice } from "@/lib/slug";
import { whatsappHref } from "@/lib/whatsapp";

type Contact = { name: string; email: string; mobile: string };

const Num = ({ value }: { value: number }) => (
  <span dir="ltr" className="ltr">
    {formatPrice(value)}
  </span>
);

function Stepper({
  label,
  icon,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  const btn =
    "tap-target grid h-10 w-10 place-items-center rounded-xl border border-ice bg-white text-navy transition hover:bg-mist active:scale-95 disabled:opacity-40 disabled:hover:bg-white";
  return (
    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-ice bg-white p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-bold text-navy">
          {icon}
          {label}
        </div>
        {hint ? <div className="mt-0.5 text-[11px] text-muted">{hint}</div> : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`تقليل ${label}`}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="w-7 text-center text-lg font-black text-navy" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`زيادة ${label}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function CheckoutForm({
  hotelSlug,
  hotelName,
  contextLine,
  unitLabel,
  periods,
  depositPercent,
  enabled,
  whatsapp,
}: {
  hotelSlug: string;
  hotelName: string;
  contextLine: string;
  unitLabel: string;
  periods: PricePeriod[];
  depositPercent: number;
  enabled: boolean;
  whatsapp?: string;
}) {
  const [periodIndex, setPeriodIndex] = useState(0);
  const [occupancy, setOccupancy] = useState<Occupancy>("double");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [nights, setNights] = useState(periods[0]?.nights ?? 3);
  const [contact, setContact] = useState<Contact>({ name: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const period = periods[periodIndex];
  const occOptions = useMemo(() => availableOccupancies(period), [period]);
  const occ: Occupancy = occOptions.includes(occupancy) ? occupancy : occOptions[0];
  const childAllowed = hasChildPricing(period);
  const perNight = isPerNight(period);
  const effChildren = childAllowed ? children : 0;

  const breakdown = useMemo(
    () => computeBreakdown(periods, { periodIndex, occupancy: occ, adults, children: effChildren, nights }),
    [periods, periodIndex, occ, adults, effChildren, nights],
  );

  const deposit = Math.round((breakdown.total * depositPercent) / 100);
  const dateRange =
    period?.dateFrom && period?.dateTo ? `${period.dateFrom} → ${period.dateTo}` : period?.period;

  const waMessage = useMemo(() => {
    const lines = [
      `مرحباً، أرغب في حجز ${hotelName} — ${contextLine}`,
      `• الفترة: ${period?.period ?? "—"}`,
      `• الغرفة: ${occ === "triple" ? "ثلاثية" : "مزدوجة"}`,
      `• البالغون: ${breakdown.adults}${effChildren ? ` • الأطفال: ${effChildren}` : ""}`,
      perNight ? `• عدد الليالي: ${breakdown.nightsCharged}` : "",
      breakdown.computable ? `• الإجمالي التقديري: ${formatPrice(breakdown.total)} ج.م` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [hotelName, contextLine, period, occ, breakdown, effChildren, perNight]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelSlug,
          periodIndex,
          occupancy: occ,
          adults,
          children: effChildren,
          nights: breakdown.nightsCharged,
          ...contact,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { redirectUrl?: string; message?: string }
        | null;
      if (!res.ok || !data?.redirectUrl) {
        throw new Error(data?.message ?? "تعذّر بدء الدفع. برجاء المحاولة مرة أخرى.");
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-[14px] border border-ice bg-white px-4 py-3 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/15";
  const upd = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact((c) => ({ ...c, [k]: e.target.value }));

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      {/* ── Calculator + contact ─────────────────────────────── */}
      <div className="order-2 space-y-6 md:order-1">
        <section className="surface rounded-[22px] p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-extrabold text-navy">تفاصيل الإقامة</h2>

          {/* Period */}
          <label className="mb-1.5 block text-sm font-bold text-navy" htmlFor="ck-period">
            الفترة
          </label>
          <div className="relative">
            <CalendarDays
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue"
              aria-hidden
            />
            <select
              id="ck-period"
              value={periodIndex}
              onChange={(e) => {
                const i = Number(e.target.value);
                setPeriodIndex(i);
                setNights(periods[i]?.nights ?? nights);
              }}
              className={`${field} appearance-none pr-10`}
            >
              {periods.map((p, i) => (
                <option key={i} value={i}>
                  {p.period}
                  {p.board ? ` — ${p.board}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Occupancy */}
          {occOptions.length > 1 ? (
            <div className="mt-4">
              <div className="mb-1.5 text-sm font-bold text-navy">نوع الغرفة</div>
              <div className="grid grid-cols-2 gap-2">
                {occOptions.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOccupancy(o)}
                    className={`tap-target flex items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-bold transition ${
                      occ === o
                        ? "border-navy bg-navy text-white"
                        : "border-ice bg-white text-navy hover:bg-mist"
                    }`}
                    aria-pressed={occ === o}
                  >
                    <BedDouble className="h-4 w-4" aria-hidden />
                    {o === "triple" ? "غرفة ثلاثية" : "غرفة مزدوجة"}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Steppers */}
          <div className="mt-4 space-y-3">
            <Stepper
              label="البالغون"
              icon={<Users className="h-4 w-4 text-blue" aria-hidden />}
              value={adults}
              min={1}
              max={20}
              onChange={setAdults}
            />
            {childAllowed ? (
              <Stepper
                label="الأطفال"
                icon={<Baby className="h-4 w-4 text-blue" aria-hidden />}
                value={children}
                min={0}
                max={10}
                onChange={setChildren}
                hint={
                  period?.childAgeFrom != null && period?.childAgeTo != null
                    ? `سن ${period.childAgeFrom}–${period.childAgeTo} سنة`
                    : undefined
                }
              />
            ) : null}
            {perNight ? (
              <Stepper
                label="عدد الليالي"
                icon={<Moon className="h-4 w-4 text-blue" aria-hidden />}
                value={nights}
                min={1}
                max={30}
                onChange={setNights}
              />
            ) : period?.nights ? (
              <div className="flex items-center justify-between rounded-[16px] border border-ice bg-mist p-3 text-sm">
                <span className="flex items-center gap-1.5 font-bold text-navy">
                  <Moon className="h-4 w-4 text-blue" aria-hidden /> مدة الباقة
                </span>
                <span className="font-extrabold text-navy">{period.nights} ليالٍ</span>
              </div>
            ) : null}
          </div>
        </section>

        {enabled ? (
          <form onSubmit={onSubmit} className="surface space-y-4 rounded-[22px] p-5 sm:p-6" noValidate>
            <h2 className="text-lg font-extrabold text-navy">بياناتك</h2>
            <div>
              <label htmlFor="ck-name" className="mb-1.5 block text-sm font-bold text-navy">
                الاسم بالكامل
              </label>
              <input id="ck-name" required autoComplete="name" value={contact.name} onChange={upd("name")} className={field} />
            </div>
            <div>
              <label htmlFor="ck-email" className="mb-1.5 block text-sm font-bold text-navy">
                البريد الإلكتروني
              </label>
              <input
                id="ck-email"
                type="email"
                inputMode="email"
                dir="ltr"
                required
                autoComplete="email"
                value={contact.email}
                onChange={upd("email")}
                className={`${field} text-right`}
              />
            </div>
            <div>
              <label htmlFor="ck-mobile" className="mb-1.5 block text-sm font-bold text-navy">
                رقم الموبايل
              </label>
              <input
                id="ck-mobile"
                type="tel"
                inputMode="tel"
                dir="ltr"
                required
                autoComplete="tel"
                placeholder="01xxxxxxxxx"
                value={contact.mobile}
                onChange={upd("mobile")}
                className={`${field} text-right`}
              />
            </div>

            {error ? (
              <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !breakdown.computable}
              className="tap-target inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-navy px-5 font-extrabold text-white transition hover:bg-blue active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden />
              )}
              {loading ? "جارٍ التحويل للدفع الآمن…" : "المتابعة للدفع الآمن"}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
              دفع آمن عبر EasyKash — بطاقات، محافظ، وتقسيط.
            </p>
          </form>
        ) : (
          <div className="surface rounded-[22px] p-5 text-center sm:p-6">
            <p className="mb-4 text-sm leading-relaxed text-navy/80">
              راجع اختياراتك أعلاه ثم أكمل الحجز مع فريقنا عبر واتساب لتأكيد السعر النهائي والتوافر.
            </p>
            <a
              href={whatsappHref(waMessage, whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="tap-target inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-whatsapp px-5 font-extrabold text-white transition hover:brightness-105 active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              متابعة الحجز عبر واتساب
            </a>
          </div>
        )}
      </div>

      {/* ── Live summary ─────────────────────────────────────── */}
      <aside className="order-1 md:order-2">
        <div className="overflow-hidden rounded-[22px] border border-ice bg-white shadow-card md:sticky md:top-24">
          <div className="bg-navy px-5 py-4 text-white">
            <div className="text-xs font-extrabold text-champagne">ملخص الحجز</div>
            <div className="mt-1 text-lg font-black leading-tight">{hotelName}</div>
            <div className="text-xs text-white/70">{contextLine}</div>
          </div>

          <dl className="space-y-2.5 p-5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">الفترة</dt>
              <dd dir="ltr" className="ltr text-left font-semibold text-navy">{dateRange}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">الغرفة</dt>
              <dd className="font-semibold text-navy">{occ === "triple" ? "ثلاثية" : "مزدوجة"}</dd>
            </div>

            {breakdown.computable ? (
              <>
                <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-ice pt-3">
                  <dt className="text-muted">
                    البالغون ({breakdown.adults}
                    {breakdown.isPerNight ? ` × ${breakdown.nightsCharged} ليلة` : ""})
                  </dt>
                  <dd className="font-semibold text-navy">
                    <Num value={breakdown.adultsTotal} /> ج.م
                  </dd>
                </div>
                {effChildren > 0 ? (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">
                      الأطفال ({effChildren}
                      {breakdown.isPerNight ? ` × ${breakdown.nightsCharged} ليلة` : ""})
                    </dt>
                    <dd className="font-semibold text-navy">
                      <Num value={breakdown.childrenTotal} /> ج.م
                    </dd>
                  </div>
                ) : null}

                <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-ice pt-3">
                  <dt className="font-bold text-navy">الإجمالي</dt>
                  <dd className="text-xl font-black text-navy">
                    <Num value={breakdown.total} /> <span className="text-xs font-semibold">ج.م</span>
                  </dd>
                </div>
                {enabled && depositPercent < 100 ? (
                  <div className="flex items-baseline justify-between gap-3 rounded-[14px] bg-champagne/10 px-3 py-2">
                    <dt className="font-bold text-champagne-ink">دفعة التأكيد ({depositPercent}%)</dt>
                    <dd className="text-lg font-black text-navy">
                      <Num value={deposit} /> <span className="text-xs font-semibold">ج.م</span>
                    </dd>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-1 border-t border-ice pt-3 text-center text-sm text-muted">
                السعر لهذه الفترة يُؤكَّد مع فريقنا مباشرةً.
              </div>
            )}
          </dl>
          <p className="border-t border-ice px-5 py-3 text-[11px] leading-relaxed text-muted">
            الأسعار {unitLabel}. التوافر والسعر النهائي يُؤكَّدان من فريقنا.
          </p>
        </div>
      </aside>
    </div>
  );
}
