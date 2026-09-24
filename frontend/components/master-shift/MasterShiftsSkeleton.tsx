import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_MEMBER_COUNT = 20;

const SkeletonMemberRows = Array.from({
  length: SKELETON_MEMBER_COUNT,
});

const SkeletonDays = Array.from({ length: 31 }, (_, index) => index + 1);

export function MasterShiftsSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-1 md:gap-3">
          <Button variant="link" size="icon" disabled>
            <ChevronLeft className="size-4" />
          </Button>

          <Skeleton className="h-7 w-32" />

          <Button variant="link" size="icon" disabled>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4 px-3 py-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked disabled />
            <span>勤務</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked disabled />
            <span>休み</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked disabled />
            <span>モダリティ</span>
          </label>
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
                      "sticky left-0 z-10 h-10 w-16.5",
                      "border-r border-b border-slate-200",
                      "p-0.5 text-center md:h-12 md:w-20 md:min-w-20 md:p-1",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                    )}
                  >
                    <Skeleton className="mx-auto h-3 w-10 animate-pulse  md:w-14" />
                  </th>

                  {SkeletonDays.map((day) => (
                    <td
                      key={day}
                      className={cn(
                        "h-13 w-13",
                        "border-r border-b border-slate-200",
                        "p-0 last:border-r-0",
                        "md:h-15 md:w-14",
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
    </>
  );
}
