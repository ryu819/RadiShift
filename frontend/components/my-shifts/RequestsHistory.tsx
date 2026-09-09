import { RotateCcw } from "lucide-react";

import { DayOffRequestDeleteDialog } from "@/components/my-shifts/DayOffRequestDeleteDialog";
import { WorkRequestDeleteDialog } from "@/components/my-shifts/WorkRequestDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dayjs } from "@/lib/dayjs";
import type { DayOffRequest } from "@/types/day-off-request";
import type { WorkRequest } from "@/types/work-request";
import { badgeStyle } from "@/utils/badge-style";

type Props = {
  dayOffRequests: DayOffRequest[];
  workRequests: WorkRequest[];
};

const getStatusLabel = (requestStatus: string) => {
  switch (requestStatus) {
    case "pending":
      return "承認待ち";
    case "approved":
      return "承認";
    case "rejected":
      return "否認";
    default:
      return requestStatus;
  }
};

const getStatusClassName = (requestStatus: string) => {
  switch (requestStatus) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-gray-200 bg-gray-50 text-gray-700";
    default:
      return "";
  }
};

export function RequestsHistory({ dayOffRequests, workRequests }: Props) {
  return (
    <div className="grid gap-4 items-start sm:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">休み申請履歴</CardTitle>
        </CardHeader>

        <CardContent>
          {dayOffRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              この月の休み申請履歴はありません。
            </p>
          ) : (
            <div className="divide-y">
              {dayOffRequests.map((request) => (
                <div
                  key={request.id}
                  className="py-2 first:pt-0 last:pb-0 lg:flex lg:items-center lg:py-4"
                >
                  <div className="min-w-30 whitespace-nowrap text-sm font-medium">
                    {dayjs(request.scheduleDay.date).format("M月D日")}（
                    {request.scheduleDay.weekdayLabel}）
                  </div>

                  <div className="max-lg:mt-2 w-full flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 ">
                      <Badge
                        variant="outline"
                        style={badgeStyle(request.dayOffType.colorCode)}
                      >
                        {request.dayOffType.name}
                      </Badge>

                      {request.isReturn && (
                        <div className="flex items-center gap-1  text-amber-700">
                          <RotateCcw className="size-3" />
                          <span className="text-xs font-medium  whitespace-nowrap">
                            返上
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex  min-w-16 items-center">
                        <Badge
                          variant="outline"
                          className={getStatusClassName(request.requestStatus)}
                        >
                          {getStatusLabel(request.requestStatus)}
                        </Badge>
                      </div>

                      <div className="min-w-4">
                        {request.requestStatus === "pending" && (
                          <DayOffRequestDeleteDialog dayOffRequest={request} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">勤務申請履歴</CardTitle>
        </CardHeader>

        <CardContent>
          {workRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              この月の勤務申請履歴はありません。
            </p>
          ) : (
            <div className="divide-y">
              {workRequests.map((request) => (
                <div
                  key={request.id}
                  className="py-2 first:pt-0 last:pb-0 lg:flex lg:items-center lg:py-4"
                >
                  <div className="min-w-30 whitespace-nowrap text-sm font-medium">
                    {dayjs(request.scheduleDay.date).format("M月D日")}（
                    {request.scheduleDay.weekdayLabel}）
                  </div>

                  <div className="max-lg:mt-2 w-full flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 ">
                      <Badge
                        variant="outline"
                        style={badgeStyle(request.workType.colorCode)}
                      >
                        {request.workType.name}
                      </Badge>

                      {request.isReturn && (
                        <div className="flex items-center gap-1  text-amber-700">
                          <RotateCcw className="size-3" />
                          <span className="text-xs font-medium  whitespace-nowrap">
                            返上
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex  min-w-16 items-center">
                        <Badge
                          variant="outline"
                          className={getStatusClassName(request.requestStatus)}
                        >
                          {getStatusLabel(request.requestStatus)}
                        </Badge>
                      </div>

                      <div className="min-w-4">
                        {request.requestStatus === "pending" && (
                          <WorkRequestDeleteDialog workRequest={request} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
