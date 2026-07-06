"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Printer,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Staff = {
  id: number;
  name: string;
};

type ShiftType = {
  id: string;
  label: string;
  color: string;
  badgeClassName: string;
};

type ShiftAssignmentMap = {
  [key: string]: string[];
};

const staffList: Staff[] = [
  { id: 1, name: "管理者" },
  { id: 2, name: "田中 太郎" },
  { id: 3, name: "佐藤 花子" },
  { id: 4, name: "鈴木 一郎" },
  { id: 5, name: "高橋 美咲" },
  { id: 6, name: "伊藤 健太" },
  { id: 7, name: "渡辺 明美" },
  { id: 8, name: "山本 大輔" },
  { id: 9, name: "中村 由美" },
  { id: 10, name: "小林 翔太" },
  { id: 11, name: "加藤 真理子" },
  { id: 12, name: "吉田 拓也" },
  { id: 13, name: "山田 智子" },
  { id: 14, name: "佐々木 健二" },
  { id: 15, name: "井上 直樹" },
  { id: 16, name: "木村 優子" },
  { id: 17, name: "林 大地" },
  { id: 18, name: "清水 彩" },
  { id: 19, name: "山口 翔" },
  { id: 20, name: "松本 真央" },
  { id: 21, name: "斎藤 悠人" },
  { id: 22, name: "森 里奈" },
  { id: 23, name: "池田 亮" },
  { id: 24, name: "橋本 美月" },
  { id: 25, name: "阿部 拓真" },
  { id: 26, name: "石川 奈々" },
  { id: 27, name: "前田 俊介" },
  { id: 28, name: "藤田 愛" },
  { id: 29, name: "岡田 翔平" },
  { id: 30, name: "後藤 由香" },
];

const shiftTypes: ShiftType[] = [
  {
    id: "day",
    label: "日勤",
    color: "bg-amber-500",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    id: "night",
    label: "夜勤",
    color: "bg-indigo-500",
    badgeClassName: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    id: "early",
    label: "早番",
    color: "bg-sky-500",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    id: "late",
    label: "遅番",
    color: "bg-rose-500",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700 ",
  },
];

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

function formatYearMonth(date: Date) {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaysInMonth(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const days = [];

  for (let index = 0; index < lastDay; index++) {
    const date = new Date(year, month, index + 1);
    const dayOfWeek = date.getDay();

    days.push({
      date,
      dateKey: formatDateKey(date),
      day: index + 1,
      weekdayLabel: weekdayLabels[dayOfWeek],
      isSunday: dayOfWeek === 0,
      isSaturday: dayOfWeek === 6,
    });
  }

  return days;
}

function getCellKey(staffId: number, dateKey: string) {
  return `${staffId}-${dateKey}`;
}

export default function Page() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));

  const [assignments, setAssignments] = useState<ShiftAssignmentMap>({
    "1-2026-01-01": ["day"],
    "1-2026-01-04": ["day", "early"],
    "2-2026-01-04": ["day"],
    "3-2026-01-03": ["night"],
    "10-2026-01-08": ["early"],
    "14-2026-01-12": ["late"],
    "20-2026-01-18": ["night"],
    "25-2026-01-24": ["day"],
  });

  const [openCellKey, setOpenCellKey] = useState<string | null>(null);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleSelectShift = (
    staffId: number,
    dateKey: string,
    shiftTypeId: string,
  ) => {
    const cellKey = getCellKey(staffId, dateKey);

    setAssignments((prev) => {
      const currentShiftIds = prev[cellKey] ?? [];

      const nextShiftIds = currentShiftIds.includes(shiftTypeId)
        ? currentShiftIds.filter((id) => id !== shiftTypeId)
        : [...currentShiftIds, shiftTypeId];

      if (nextShiftIds.length === 0) {
        const next = { ...prev };
        delete next[cellKey];
        return next;
      }

      return {
        ...prev,
        [cellKey]: nextShiftIds,
      };
    });
  };

  const handleDeleteShift = (staffId: number, dateKey: string) => {
    const cellKey = getCellKey(staffId, dateKey);

    setAssignments((prev) => {
      const next = { ...prev };
      delete next[cellKey];
      return next;
    });
  };

  return (
    <div className="flex min-h-0  flex-1 p-2 md:p-4">
      <div className="flex h-full   w-full flex-col gap-1.5 md:gap-6">
        <div className="flex  items-center justify-between">
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
          <Button variant="link" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h1 className="text-xl font-semibold md:text-2xl">
            {formatYearMonth(currentMonth)}
          </h1>

          <Button variant="link" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div
          className=" flex-1 overflow-auto overscroll-none rounded-sm border border-slate-200 bg-white shadow-sm"
          onScroll={() => setOpenCellKey(null)}
        >
          <table className="w-max min-w-full border-collapse text-xs md:text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30  border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center text-xs font-semibold md:p-1 md:text-sm">
                  スタッフ
                </th>

                {days.map((day) => (
                  <th
                    key={day.dateKey}
                    className="w-9 min-w-9 border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center last:border-r-0 md:w-12 md:min-w-12 md:p-1"
                  >
                    <div
                      className={cn(
                        "text-xs font-bold leading-none md:text-sm",
                        day.isSunday && "text-rose-500",
                        day.isSaturday && "text-blue-500",
                      )}
                    >
                      {day.day}
                    </div>

                    <div
                      className={cn(
                        "mt-0.5 text-[9px] font-medium md:mt-1 md:text-[10px]",
                        day.isSunday && "text-rose-500",
                        day.isSaturday && "text-blue-500",
                      )}
                    >
                      {day.weekdayLabel}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {staffList.map((staff, rowIndex) => (
                <tr key={staff.id}>
                  <th
                    className={cn(
                      "sticky left-0 z-10 border-r border-b border-slate-200 p-0.5 text-center text-xs font-medium md:p-1 md:text-sm",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                    )}
                  >
                    <span className="block truncate">{staff.name}</span>
                  </th>

                  {days.map((day) => {
                    const cellKey = getCellKey(staff.id, day.dateKey);
                    const selectedShiftIds = assignments[cellKey] ?? [];
                    const selectedShifts = selectedShiftIds
                      .map((shiftId) =>
                        shiftTypes.find((shift) => shift.id === shiftId),
                      )
                      .filter((shift) => shift !== undefined);

                    return (
                      <td
                        key={cellKey}
                        className={cn(
                          "h-10 w-9 border-r border-b border-slate-200 p-0 last:border-r-0 md:h-12 md:w-12",
                          rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                        )}
                      >
                        <Popover
                          open={openCellKey === cellKey}
                          onOpenChange={(open) =>
                            setOpenCellKey(open ? cellKey : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              aria-label={`${staff.name} ${day.dateKey} のシフトを編集`}
                              className="flex h-full w-full cursor-pointer items-center justify-center  p-0.5 transition hover:bg-blue-50 md:p-1"
                            >
                              <div className="flex  flex-col items-center gap-0.5 md:gap-1 ">
                                {selectedShifts.map((selectedShift) => (
                                  <Badge
                                    key={selectedShift.id}
                                    variant="outline"
                                    className={cn(
                                      "h-[14px]   rounded px-1 py-0 text-[10px] font-semibold leading-none  md:rounded-md md:px-1.5 md:py-0.5 ",
                                      selectedShift.badgeClassName,
                                    )}
                                  >
                                    <span className="md:hidden">
                                      {selectedShift.label.slice(0, 1)}
                                    </span>
                                    <span className="hidden md:inline">
                                      {selectedShift.label}
                                    </span>
                                  </Badge>
                                ))}
                              </div>
                            </button>
                          </PopoverTrigger>

                          <PopoverContent
                            side="bottom"
                            align="center"
                            sideOffset={6}
                            hideWhenDetached
                            className="w-32 rounded-md border-slate-200 p-3 shadow-lg"
                          >
                            <div className="p-1">
                              <p className="text-sm font-medium text-secondary">
                                {staff.name}
                              </p>
                              <p className="mt-1 text-xs text-secondary">
                                {formatYearMonth(currentMonth)}
                                {day.day}日
                              </p>
                            </div>

                            <div className="space-y-0.5">
                              {shiftTypes.map((shiftType) => (
                                <Button
                                  key={shiftType.id}
                                  type="button"
                                  variant="ghost"
                                  className={cn(
                                    "h-7 w-full justify-start gap-2 px-1 text-secondary hover:bg-white hover:opacity-70",
                                    selectedShiftIds.includes(shiftType.id) &&
                                      "text-primary hover:text-primary",
                                  )}
                                  onClick={() => {
                                    handleSelectShift(
                                      staff.id,
                                      day.dateKey,
                                      shiftType.id,
                                    );
                                  }}
                                >
                                  <span
                                    className={cn(
                                      "h-2.5 w-2.5 rounded-full",
                                      shiftType.color,
                                    )}
                                  />
                                  {shiftType.label}
                                </Button>
                              ))}
                            </div>

                            <Separator className="my-1" />

                            <Button
                              type="button"
                              variant="ghost"
                              className="h-7 w-full justify-start  gap-1.5 text-rose-600 hover:bg-white hover:text-rose-600 hover:opacity-70"
                              onClick={() => {
                                handleDeleteShift(staff.id, day.dateKey);
                                setOpenCellKey(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              削除する
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
