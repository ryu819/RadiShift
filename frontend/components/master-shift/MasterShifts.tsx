import { CalendarDays, CircleHelp, LockKeyhole } from "lucide-react";

import { MasterShiftsEmpty } from "@/components/master-shift/MasterShiftsEmpty";
import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { ShiftTable } from "@/components/master-shift/ShiftTable";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { getMasterShiftScheduleMonths } from "@/lib/actions/schedule-months/get-master-shift-schedule-months";
import { getScheduleMonth } from "@/lib/actions/schedule-months/get-schedule-month";
import { getMasterShiftAssignments } from "@/lib/actions/shift-assignments/get-master-shift-assignments";
import { getDayOffTypes } from "@/lib/actions/shift-types/get-day-off-types";
import { getModalityTypes } from "@/lib/actions/shift-types/get-modality-types";
import { getWorkTypes } from "@/lib/actions/shift-types/get-work-types";
import { getCurrentYearMonth } from "@/lib/get-current-year-month";
import { selectScheduleMonth } from "@/lib/select-schedule-month";

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export async function MasterShifts({ searchParams }: Props) {
  const params = await searchParams;

  const [
    currentUser,
    workTypes,
    dayOffTypes,
    modalityTypes,
    scheduleMonthList,
    currentYearMonth,
  ] = await Promise.all([
    getCurrentUser(),
    getWorkTypes(),
    getDayOffTypes(),
    getModalityTypes(),
    getMasterShiftScheduleMonths(),
    getCurrentYearMonth(),
  ]);

  const requestedScheduleMonthId = params.scheduleMonthId
    ? Number(params.scheduleMonthId)
    : null;

  if (!scheduleMonthList || scheduleMonthList.length === 0) {
    return <MasterShiftsEmpty isAdmin={currentUser?.isAdmin ?? false} />;
  }

  const selectedScheduleMonth = selectScheduleMonth({
    scheduleMonths: scheduleMonthList,
    requestedScheduleMonthId,
    currentYearMonth,
  });

  const [scheduleMonth, masterShiftAssignments] = await Promise.all([
    getScheduleMonth(selectedScheduleMonth.id),
    getMasterShiftAssignments(selectedScheduleMonth.id),
  ]);

  return (
    <>
      <div className="master-shift-print-hide flex h-8 items-center justify-between text-xs md:text-sm">
        <div className="flex items-center gap-1 md:gap-2">
          <CalendarDays className="size-3.5 md:size-4" />
          <span>全体シフト</span>
        </div>

        {currentUser?.isAdmin && (
          <Popover>
            <PopoverTrigger className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-secondary">
              <CircleHelp className="size-3" />
              使い方
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={6}
              className="w-72 space-y-1 p-3 text-secondary"
            >
              <ul className="list-disc space-y-1 pl-4 text-sm">
                <li>セルを選択すると、シフトを編集できます</li>
                <li>過去日のシフトは編集できません</li>
                <li>
                  <LockKeyhole className="mb-1 mr-0.5 inline size-3.5" />
                  鍵アイコンは本人申請から作成された割当です
                </li>
              </ul>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <MonthNavigation
          scheduleMonths={scheduleMonthList}
          selectedScheduleMonthId={selectedScheduleMonth.id}
          year={selectedScheduleMonth.year}
          month={selectedScheduleMonth.month}
        />

        {scheduleMonth?.isPublished ? (
          <Badge className="bg-emerald-100 text-emerald-700 rounded-sm master-shift-print-hide">
            シフト公開済
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700 rounded-sm master-shift-print-hide">
            シフト未公開
          </Badge>
        )}
      </div>

      <ShiftTable
        members={masterShiftAssignments?.members ?? []}
        workTypes={workTypes ?? []}
        dayOffTypes={dayOffTypes ?? []}
        modalityTypes={modalityTypes ?? []}
        workAssignmentsByUserAndDay={
          masterShiftAssignments?.workAssignmentsByUserAndDay ?? {}
        }
        dayOffAssignmentsByUserAndDay={
          masterShiftAssignments?.dayOffAssignmentsByUserAndDay ?? {}
        }
        modalityAssignmentsByUserAndDay={
          masterShiftAssignments?.modalityAssignmentsByUserAndDay ?? {}
        }
        days={scheduleMonth?.scheduleDays ?? []}
        year={selectedScheduleMonth.year}
        month={selectedScheduleMonth.month}
        isAdmin={currentUser?.isAdmin ?? false}
      />
    </>
  );
}
