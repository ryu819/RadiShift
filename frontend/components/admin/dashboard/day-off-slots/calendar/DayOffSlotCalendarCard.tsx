"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DayOffSlotCalendar } from "@/components/admin/dashboard/day-off-slots/calendar/DayOffSlotCalendar";
import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import type { DayOffType } from "@/types/day-off-type";
import type { ScheduleMonth } from "@/types/schedule-month";
import type { ScheduleMonths } from "@/types/schedule-months";

type Props = {
  dayOffTypes: DayOffType[];
  scheduleMonths: ScheduleMonths[];
  scheduleMonth: ScheduleMonth | null;
  selectedScheduleMonthId: number | null;
};

export function DayOffSlotCalendarCard({
  dayOffTypes,
  scheduleMonths,
  scheduleMonth,
  selectedScheduleMonthId,
}: Props) {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(
    dayOffTypes[0]?.id ?? null,
  );

  const selectedDayOffType =
    dayOffTypes.find((dayOffType) => dayOffType.id === selectedTypeId) ??
    dayOffTypes[0] ??
    null;

  return (
    <>
      <Card className="gap-4 pt-5 pb-4 shadow-none">
        <CardHeader>
          <div>
            <CardTitle className="text-base">特定日の調整</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              作成済みのシフト表について、特定の日付を選択し休み枠を調整します
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 px-4">
          {dayOffTypes.length === 0 ? (
            <div className="flex flex-col items-center mb-2">
              <p className="py-6 text-center text-sm text-muted-foreground">
                休み枠を使用する休みタイプがありません
              </p>

              <Link
                href={ROUTES.adminShiftTypes}
                className="group flex items-center gap-1 text-sm font-medium text-primary hover:opacity-70"
              >
                休みタイプを作成
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5  group-active:translate-x-0.5" />
              </Link>
            </div>
          ) : !scheduleMonth || selectedScheduleMonthId === null ? (
            <div className="flex flex-col items-center mb-2">
              <p className="py-6 text-center text-sm text-muted-foreground">
                対象月のシフトを作成してください
              </p>
              <Link
                href={`${ROUTES.adminDashboard}#schedule-months`}
                className="group flex items-center gap-1 text-sm font-medium text-primary hover:opacity-70"
              >
                シフト表を作成
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5  group-active:translate-x-0.5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">休みタイプ</p>

                <Select
                  value={
                    selectedDayOffType
                      ? String(selectedDayOffType.id)
                      : undefined
                  }
                  onValueChange={(value) => {
                    setSelectedTypeId(Number(value));
                  }}
                >
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {dayOffTypes.map((dayOffType) => (
                        <SelectItem
                          key={dayOffType.id}
                          value={String(dayOffType.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{
                                backgroundColor: dayOffType.colorCode,
                              }}
                            />

                            {dayOffType.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-sm border">
                <div className="border-b py-2">
                  <MonthNavigation
                    scheduleMonths={scheduleMonths}
                    selectedScheduleMonthId={selectedScheduleMonthId}
                    year={scheduleMonth.year}
                    month={scheduleMonth.month}
                  />
                </div>

                <DayOffSlotCalendar
                  scheduleDays={scheduleMonth.scheduleDays}
                  selectedDayOffType={selectedDayOffType}
                  selectedScheduleMonthId={selectedScheduleMonthId}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
