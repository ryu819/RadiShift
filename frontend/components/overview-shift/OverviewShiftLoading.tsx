import { CalendarDays, ChevronLeft, ChevronRight, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOADING_MEMBER_COUNT = 20;

const loadingMemberRows = Array.from({
  length: LOADING_MEMBER_COUNT,
});

const loadingDays = Array.from({ length: 31 }, (_, index) => index + 1);

export function OverviewShiftLoading() {
  return (
    <div className="flex min-h-0 flex-1 p-3 md:p-6">
      <div className="flex h-full w-full flex-col gap-1.5 md:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>全体シフト</span>
          </div>

          <Button type="button" size="sm" className="h-8 px-2 md:h-10 md:px-4">
            <Printer className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="">印刷</span>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-1 md:gap-3">
          <Button type="button" variant="link" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h1 className="flex h-8 items-center">
            <span className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          </h1>

          <Button type="button" variant="link" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto overscroll-none rounded-sm border border-slate-200 bg-white shadow-sm">
          <table className="w-max min-w-full border-collapse text-xs md:text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center text-xs font-semibold md:p-1 md:text-sm">
                  スタッフ
                </th>

                {loadingDays.map((day) => (
                  <th
                    key={day}
                    className="w-9 min-w-9 border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center md:w-12 md:min-w-12 md:p-1"
                  >
                    <div className="text-xs font-bold md:text-sm">{day}</div>

                    <div className="mt-0.5 h-2 md:mt-1" />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loadingMemberRows.map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <th
                    className={cn(
                      "sticky left-0 z-10 h-10 w-16",
                      "border-r border-b border-slate-200",
                      "p-0.5 text-center md:h-12 md:w-20 md:min-w-20 md:p-1",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                    )}
                  >
                    <div
                      className="mx-auto h-3 w-10 animate-pulse rounded bg-slate-200 md:w-14"
                      aria-hidden="true"
                    />
                  </th>

                  {loadingDays.map((day) => (
                    <td
                      key={day}
                      className={cn(
                        "h-10 w-9 min-w-9",
                        "border-r border-b border-slate-200",
                        "p-0 last:border-r-0",
                        "md:h-12 md:w-12 md:min-w-12",
                        rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                      )}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
