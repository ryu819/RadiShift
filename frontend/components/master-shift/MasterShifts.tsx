import { MasterShiftsEmpty } from "@/components/master-shift/MasterShiftsEmpty";
import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { ShiftTable } from "@/components/master-shift/ShiftTable";
import { Badge } from "@/components/ui/badge";
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
    return <MasterShiftsEmpty />;
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
      <div className="flex flex-col items-center justify-center gap-2">
        <MonthNavigation
          scheduleMonths={scheduleMonthList}
          selectedScheduleMonthId={selectedScheduleMonth.id}
          year={selectedScheduleMonth.year}
          month={selectedScheduleMonth.month}
        />

        {scheduleMonth?.isPublished ? (
          <Badge className="bg-emerald-100 text-emerald-700 rounded-sm">
            シフト公開済
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700 rounded-sm">
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
        isEditable={currentUser?.isAdmin ?? false}
      />
    </>
  );
}
