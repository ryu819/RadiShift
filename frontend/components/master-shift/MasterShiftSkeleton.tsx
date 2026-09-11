import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SKELETON_MEMBER_COUNT = 20;

const SkeletonMemberRows = Array.from({
  length: SKELETON_MEMBER_COUNT,
});

const SkeletonDays = Array.from({ length: 31 }, (_, index) => index + 1);

export function MasterShiftSkeleton() {
  return (
    <>
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

              {SkeletonDays.map((day) => (
                <th
                  key={day}
                  className="w-10 min-w-10 border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center md:w-14 md:min-w-14 md:p-1"
                >
                  <div className="text-xs font-bold md:text-sm">{day}</div>

                  <div className="mt-0.5 h-2 md:mt-1" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {SkeletonMemberRows.map((_, rowIndex) => (
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

                {SkeletonDays.map((day) => (
                  <td
                    key={day}
                    className={cn(
                      "h-10 w-10 min-w-10",
                      "border-r border-b border-slate-200",
                      "p-0 last:border-r-0",
                      "md:h-14 md:w-14 md:min-w-14",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                    )}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
