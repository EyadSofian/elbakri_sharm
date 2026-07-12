import { CalendarDays, Users } from "lucide-react";
import type { PricePeriod } from "@/lib/catalog";
import { parsePrice } from "@/lib/slug";
import { Price } from "@/components/Price";

export function HotelPricePeriods({
  hotelName,
  periods,
  unitLabel,
}: {
  hotelName: string;
  periods: PricePeriod[];
  unitLabel: string;
}) {
  if (periods.length === 0) {
    return (
      <div className="rounded-[20px] border border-champagne/35 bg-champagne/10 p-5 text-sm leading-relaxed text-navy">
        الفندق مضاف إلى الباقة، ولم يُنشر له سعر جاهز بعد. تواصل معنا لتأكيد السعر والتوافر.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {periods.map((period, index) => (
          <article key={index} className="surface overflow-hidden rounded-[18px]">
            <div className="flex items-center gap-2 border-b border-ice bg-mist px-4 py-3 text-sm font-extrabold text-navy">
              <CalendarDays className="h-4 w-4 text-blue" aria-hidden />
              <span dir="ltr" className="ltr">
                {period.period}
              </span>
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                <span className="text-muted">نظام الإقامة</span>
                <span className="font-extrabold text-navy">{period.board ?? "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[14px] bg-navy p-3 text-white">
                  <div className="flex items-center gap-1 text-[10px] text-white/65">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    غرفة مزدوجة
                  </div>
                  <div className="mt-1 text-xl font-black">
                    <Price value={parsePrice(period.double)} />
                    <span className="mr-1 text-[9px] text-white/60">ج.م</span>
                  </div>
                </div>
                <div className="rounded-[14px] border border-ice bg-white p-3">
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    غرفة ثلاثية
                  </div>
                  <div className="mt-1 text-xl font-black text-navy">
                    <Price value={parsePrice(period.triple)} />
                    <span className="mr-1 text-[9px] text-muted">ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
        <p className="px-1 text-[11px] leading-relaxed text-muted">الأسعار {unitLabel}.</p>
      </div>

      <div className="hidden overflow-hidden rounded-[20px] border border-ice bg-white md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            جدول أسعار وفترات {hotelName} — الأسعار {unitLabel}
          </caption>
          <thead>
            <tr className="bg-navy text-white">
              <th scope="col" className="p-4 text-right font-extrabold">
                الفترة
              </th>
              <th scope="col" className="p-4 text-right font-extrabold">
                الإقامة
              </th>
              <th scope="col" className="p-4 text-center font-extrabold">
                مزدوجة
              </th>
              <th scope="col" className="p-4 text-center font-extrabold">
                ثلاثية
              </th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period, index) => (
              <tr key={index} className={index % 2 ? "bg-mist" : "bg-white"}>
                <td className="p-4 text-navy">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-blue" aria-hidden />
                    <span dir="ltr" className="ltr">
                      {period.period}
                    </span>
                  </span>
                </td>
                <td className="p-4 text-muted">{period.board ?? "—"}</td>
                <td className="p-4 text-center text-base font-black text-navy">
                  <Price value={parsePrice(period.double)} />
                </td>
                <td className="p-4 text-center text-base font-black text-navy">
                  <Price value={parsePrice(period.triple)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-ice px-4 py-3 text-xs text-muted">الأسعار {unitLabel}.</p>
      </div>
    </>
  );
}
