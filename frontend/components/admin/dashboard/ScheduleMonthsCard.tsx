import { CalendarCheck2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScheduleMonths } from "@/lib/actions/get-schedule-months";

export function ScheduleMonthsCard() {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck2 className="size-5" />
          シフト月
        </CardTitle>

        <Button variant="outline" size="sm">
          シフト月を追加
        </Button>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<ScheduleMonthsSkeleton />}>
          <ScheduleMonthsList />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function ScheduleMonthsList() {
  const scheduleMonths = await getScheduleMonths();
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 ">
      {scheduleMonths?.map((scheduleMonth) => (
        <Link
          key={scheduleMonth.id}
          href={`/overview-shift?scheduleMonthId=${scheduleMonth.id}`}
          className="flex flex-col items-center justify-center cursor-pointer gap-2 rounded-md border px-3 py-4 text-sm transition-colors hover:border-primary/40 hover:bg-primary/4"
        >
          <div className="font-semibold">
            {scheduleMonth.year}年 {scheduleMonth.month}月
          </div>

          {scheduleMonth.status === "accepting_requests" && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-700 "
            >
              申請受付中
            </Badge>
          )}
          {scheduleMonth.status === "published" && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              シフト公開済み
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );
}

function ScheduleMonthsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}
