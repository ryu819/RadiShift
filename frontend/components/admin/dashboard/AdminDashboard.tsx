import {
  Building2,
  CalendarCheck2,
  CalendarClock,
  ChevronRight,
  FileText,
  KeyRound,
  LayoutDashboard,
  Settings2,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDayOffRequests } from "@/lib/actions/get-day-off-requests";
import { getDayOffTypes } from "@/lib/actions/get-day-off-types";
import { getFacility } from "@/lib/actions/get-facility";
import { getMembers } from "@/lib/actions/get-members";
import { getModalityTypes } from "@/lib/actions/get-modality-types";
import { getScheduleMonths } from "@/lib/actions/get-schedule-months";
import { getWorkRequests } from "@/lib/actions/get-work-requests";
import { getWorkTypes } from "@/lib/actions/get-work-types";

const facilityManagementItems = [
  {
    title: "招待コードを確認",
    description: "新しいメンバー招待に必要です",
    href: "/admin/members",
    icon: KeyRound,
  },
  {
    title: "申請の締切を設定",
    description: "申請の締切日を管理しましょう",
    href: "/admin/settings",
    icon: CalendarClock,
  },
  {
    title: "施設ルールの編集",
    description: "施設ルールを設定します",
    href: "/admin/settings",
    icon: SlidersHorizontal,
  },
];

type RecentRequestItem = {
  key: string;
  userName: string;
  requestedDate: string;
  requestWeekdayLabel: string;
  typeName: string;
  colorCode: string;
  createdAt: string;
};

const getBadgeStyle = (colorCode: string) => {
  return {
    borderColor: `${colorCode}55`,
    backgroundColor: `${colorCode}0D`,
    color: colorCode,
  };
};

function formatRequestedDate(dateString: string, weekdayLabel: string) {
  const [_year, month, day] = dateString.split("-").map(Number);

  return `${month}/${day}（${weekdayLabel}）`;
}

function formatCreatedAt(dateString: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(dateString));
}

export async function AdminDashboard() {
  const [
    scheduleMonths,
    facility,
    members,
    workRequests,
    dayOffRequests,
    workTypes,
    dayOffTypes,
    modalityTypes,
  ] = await Promise.all([
    getScheduleMonths(),
    getFacility(),
    getMembers(),
    getWorkRequests(),
    getDayOffRequests(),
    getWorkTypes(),
    getDayOffTypes(),
    getModalityTypes(),
  ]);

  const pendingWorkRequests =
    workRequests?.filter(
      (workRequest) => workRequest.requestStatus === "pending",
    ) ?? [];
  const pendingDayOffRequests =
    dayOffRequests?.filter(
      (dayOffRequest) => dayOffRequest.requestStatus === "pending",
    ) ?? [];

  const recentRequests: RecentRequestItem[] = [
    ...pendingDayOffRequests.map((request) => ({
      key: `day-off-${request.id}`,
      userName: request.user?.name ?? "名前未設定",
      requestedDate: request.scheduleDay.date,
      requestWeekdayLabel: request.scheduleDay.weekdayLabel,
      typeName: request.dayOffType.name,
      colorCode: request.dayOffType.colorCode,
      createdAt: request.createdAt,
    })),

    ...pendingWorkRequests.map((request) => ({
      key: `work-${request.id}`,
      userName: request.user?.name ?? "名前未設定",
      requestedDate: request.scheduleDay.date,
      requestWeekdayLabel: request.scheduleDay.weekdayLabel,
      typeName: request.workType.name,
      colorCode: request.workType.colorCode,
      createdAt: request.createdAt,
    })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const visibleRecentRequests = recentRequests.slice(0, 5);

  const remainingRequests =
    recentRequests.length - visibleRecentRequests.length;
  return (
    <div className="flex flex-1 justify-center  px-4 py-5 sm:px-6 lg:px-8">
      <div className="w-full space-y-6">
        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
          <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>管理画面TOP</span>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList variant="line" className="w-full  border-b">
            <TabsTrigger
              value="overview"
              className="cursor-pointer text-secondary data-[state=active]:text-primary"
            >
              概要
            </TabsTrigger>

            <TabsTrigger
              value="requests"
              className="cursor-pointer text-secondary data-[state=active]:text-primary"
            >
              申請
            </TabsTrigger>

            <TabsTrigger
              value="types"
              className="cursor-pointer text-secondary data-[state=active]:text-primary"
            >
              シフト設定
            </TabsTrigger>

            <TabsTrigger
              value="dayOffSlots"
              className="cursor-pointer text-secondary data-[state=active]:text-primary"
            >
              休み枠
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className=" space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="py-0 shadow-none">
                <CardContent className="flex h-full flex-col px-5 py-5">
                  <div className="flex items-center gap-3">
                    <CalendarCheck2 className="size-6 text-primary" />

                    <p className="text-sm font-medium text-muted-foreground">
                      公開シフト月
                    </p>
                  </div>

                  <div className="flex items-baseline justify-center gap-1.5 pt-5">
                    <span className="text-3xl font-semibold">
                      {scheduleMonths?.length}
                    </span>

                    <span className="text-base font-medium text-muted-foreground">
                      か月
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className=" py-0 shadow-none">
                <CardContent className="flex h-full flex-col px-5 py-5">
                  <div className="flex items-center gap-3">
                    <FileText className="size-6 text-primary" />

                    <p className="text-sm font-medium text-muted-foreground">
                      未処理の申請
                    </p>
                  </div>

                  <div className="flex items-baseline justify-center gap-1.5 pt-5">
                    <span className="text-3xl font-semibold">
                      {pendingWorkRequests.length +
                        pendingDayOffRequests.length}
                    </span>

                    <span className="text-base font-medium text-muted-foreground">
                      件
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="py-0 shadow-none">
                <CardContent className="flex h-full flex-col px-5 py-5">
                  <div className="flex items-center gap-3">
                    <Users className="size-6 text-primary" />

                    <p className="text-sm font-medium text-muted-foreground">
                      メンバー数
                    </p>
                  </div>

                  <div className="flex items-baseline justify-center gap-1.5 pt-5">
                    <span className="text-3xl font-semibold">
                      {members?.length}
                    </span>

                    <span className="text-base font-medium text-muted-foreground">
                      名
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="py-0 shadow-none">
                <CardContent className="flex h-full flex-col px-5 py-5">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="size-6 text-primary" />

                    <p className="text-sm font-medium text-muted-foreground">
                      {facility?.nextRequestDeadline.month}
                      月シフトの申請締切まで
                    </p>
                  </div>

                  <div className="flex items-baseline justify-center gap-1.5 pt-5">
                    <span className="text-3xl font-semibold">
                      {facility?.nextRequestDeadline.daysRemaining}
                    </span>

                    <span className="text-base font-medium text-muted-foreground">
                      日
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
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
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700"
                            >
                              シフト公開済み
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="gap-4 py-5 shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="size-5" />
                      未処理の申請
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {visibleRecentRequests.length > 0 ? (
                      <div>
                        {visibleRecentRequests.map((request, index) => (
                          <div key={index} className="mb-1">
                            <div className="flex items-center justify-between py-3">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  {request.userName}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  申請日時：{formatCreatedAt(request.createdAt)}
                                </p>
                              </div>

                              <div className="flex items-center">
                                <p className="text-xs">
                                  {formatRequestedDate(
                                    request.requestedDate,
                                    request.requestWeekdayLabel,
                                  )}
                                </p>
                                <Badge
                                  className="font-semibold"
                                  style={getBadgeStyle(request.colorCode)}
                                >
                                  {request.typeName}
                                </Badge>
                              </div>
                            </div>

                            {index < visibleRecentRequests.length - 1 && (
                              <Separator />
                            )}
                          </div>
                        ))}

                        {remainingRequests > 0 && (
                          <>
                            <Separator />

                            <div className="flex items-center justify-center py-2 pt-4">
                              ほか{remainingRequests}件
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        未処理の申請はありません
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-5">
                <FacilityManagementCard />

                <Card className="gap-4 py-5 shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Settings2 className="size-5" />
                      シフト設定
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:gap-6 ">
                      <h3 className="text-sm font-semibold shrink-0">
                        勤務タイプ
                      </h3>

                      <div className="flex flex-wrap">
                        {workTypes?.map((workType) => (
                          <div
                            key={workType.id}
                            className="flex items-center gap-2 px-2 py-2 text-sm"
                          >
                            <span
                              className="size-2.5 rounded-full"
                              style={{
                                backgroundColor: workType.colorCode,
                              }}
                            />

                            <span>{workType.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:gap-6 ">
                      <h3 className="text-sm font-semibold shrink-0">
                        休みタイプ
                      </h3>

                      <div className="flex flex-wrap">
                        {dayOffTypes?.map((dayOffType) => (
                          <div
                            key={dayOffType.id}
                            className="flex items-center gap-2 px-2 py-2 text-sm"
                          >
                            <span
                              className="size-2.5 rounded-full"
                              style={{
                                backgroundColor: dayOffType.colorCode,
                              }}
                            />

                            <span>{dayOffType.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 ">
                      <h3 className="text-sm font-semibold shrink-0">
                        モダリティ
                      </h3>

                      <div className="flex flex-wrap">
                        {modalityTypes?.map((modalityType) => (
                          <div
                            key={modalityType.id}
                            className="flex items-center gap-2 px-2 py-2 text-sm"
                          >
                            <span
                              className="size-2.5 rounded-full"
                              style={{
                                backgroundColor: modalityType.colorCode,
                              }}
                            />

                            <span>{modalityType.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests"></TabsContent>

          <TabsContent value="types"></TabsContent>

          <TabsContent value="dayOffSlots"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FacilityManagementCard() {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-5" />
          施設管理
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {facilityManagementItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-primary/4"
              >
                <div className="flex gap-3 items-center">
                  <Icon className="size-5" />

                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
