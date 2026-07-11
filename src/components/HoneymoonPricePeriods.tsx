import { CalendarDays } from "lucide-react";
import type { HoneymoonPeriod } from "@/lib/catalog";
import { parsePrice } from "@/lib/slug";
import { Price } from "@/components/Price";

export function HoneymoonPricePeriods({
  dealName,
  periods,
}: {
  dealName: string;
  periods: HoneymoonPeriod[];
}) {
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
            <div className="flex items-end justify-between gap-4 p-4">
              <div>
                <div className="text-[10px] text-muted">نظام الإقامة</div>
                <div className="mt-1 text-xs font-extrabold text-navy">{period.board ?? "—"}</div>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-muted">السعر</div>
                <div className="mt-1 text-2xl font-black text-navy">
                  <Price value={parsePrice(period.price)} />
                  <span className="mr-1 text-[9px] font-semibold text-muted">ج.م</span>
                </div>
                <div className="mt-1 text-[9px] text-muted">{period.unit}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[20px] border border-ice bg-white md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">جدول أسعار وفترات باقة شهر العسل في {dealName}</caption>
          <thead>
            <tr className="bg-navy text-white">
              <th scope="col" className="p-4 text-right font-extrabold">
                الفترة
              </th>
              <th scope="col" className="p-4 text-right font-extrabold">
                الإقامة
              </th>
              <th scope="col" className="p-4 text-center font-extrabold">
                السعر
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
                <td className="p-4 text-center font-black text-navy">
                  <Price value={parsePrice(period.price)} />
                  <span className="mr-1 text-[10px] font-normal text-muted">{period.unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
