import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarCheck2,
  CalendarClock,
  ChevronRight,
  FileText,
  KeyRound,
  LayoutDashboard,
  Plus,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SummaryItem = {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
};

type TypeListItem = {
  name: string;
  count: number;
  color: string;
};

type TypeListCardProps = {
  title: string;
  href: string;
  unit: string;
  items: TypeListItem[];
};

const summaryItems: SummaryItem[] = [
  {
    title: "公開シフト月",
    value: 3,
    unit: "か月",
    icon: CalendarCheck2,
  },
  {
    title: "未処理の申請",
    value: 8,
    unit: "件",
    icon: FileText,
  },
  {
    title: "メンバー数",
    value: 32,
    unit: "名",
    icon: Users,
  },
  {
    title: "9月シフトの申請締切まで",
    value: 15,
    unit: "日",
    icon: CalendarClock,
  },
];

const scheduleMonths = [
  {
    label: "2026年 6月",
    status: "公開済み",
  },
  {
    label: "2026年 7月",
    status: "公開済み",
  },
  {
    label: "2026年 8月",
    status: "申請受付中",
  },
  {
    label: "2026年 9月",
    status: "申請受付中",
  },
];

const dayOffRequests = [
  {
    id: 1,
    userName: "山田 太郎",
    requestedDate: "7/15（火）",
    type: "午後休み",
    submittedAt: "7/10 09:15",
  },
  {
    id: 2,
    userName: "田中 花子",
    requestedDate: "7/18（金）",
    type: "休み",
    submittedAt: "7/11 10:20",
  },
  {
    id: 3,
    userName: "佐藤 一郎",
    requestedDate: "7/22（火）",
    type: "午前休み",
    submittedAt: "7/12 16:40",
  },
  {
    id: 4,
    userName: "鈴木 陽",
    requestedDate: "7/19（土）",
    type: "現地外勤",
    submittedAt: "7/13 08:35",
  },
  {
    id: 5,
    userName: "鈴木 陽",
    requestedDate: "7/19（土）",
    type: "現地外勤",
    submittedAt: "7/13 08:35",
  },
];

const workTypes: TypeListItem[] = [
  {
    name: "日勤",
    count: 16,
    color: "#f59e0b",
  },
  {
    name: "夜勤",
    count: 8,
    color: "#6366f1",
  },
  {
    name: "残業",
    count: 4,
    color: "#a855f7",
  },
  {
    name: "オンコール",
    count: 2,
    color: "#22c55e",
  },
];

const dayOffTypes: TypeListItem[] = [
  {
    name: "休み",
    count: 12,
    color: "#ec4899",
  },
  {
    name: "午前休み",
    count: 6,
    color: "#f59e0b",
  },
  {
    name: "午後休み",
    count: 4,
    color: "#14b8a6",
  },
  {
    name: "有休",
    count: 3,
    color: "#16a34a",
  },
];

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

export function AdminDashboard() {
  return (
    <div className="flex flex-1 justify-center px-4 py-5 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1280px] space-y-6">
        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
          <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>管理画面TOP</span>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList variant="line" className="grid w-full grid-cols-4 border-b">
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
              value="members"
              className="cursor-pointer text-secondary data-[state=active]:text-primary"
            >
              メンバー
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-5">
            <SummaryCards />

            <div className="grid items-start gap-5 lg:grid-cols-2">
              <div className=" space-y-5">
                <ScheduleMonthCard />

                <RecentRequestsCard />
              </div>

              <div className="space-y-5">
                <FacilityManagementCard />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TypeListCard
                    title="勤務種別"
                    href="/admin/work-types"
                    items={workTypes}
                    unit="名"
                  />

                  <TypeListCard
                    title="休み種別"
                    href="/admin/day-off-types"
                    items={dayOffTypes}
                    unit="件"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-0"></TabsContent>

          <TabsContent value="members" className="mt-0"></TabsContent>

          <TabsContent value="types" className="mt-0"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SummaryCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className=" gap-0 overflow-hidden py-0 shadow-none"
          >
            <CardContent className="flex h-full flex-col px-5 py-5">
              <div className="flex items-center gap-3">
                <Icon className="size-6 text-primary" />

                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
              </div>

              <div className="flex items-baseline justify-center gap-1.5 pt-5">
                <span className="text-3xl font-bold tracking-tight">
                  {item.value}
                </span>

                {item.unit && (
                  <span className="text-base font-medium text-muted-foreground">
                    {item.unit}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function ScheduleMonthCard() {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-5">
        <CardTitle className="text-base">シフト月</CardTitle>

        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/schedule-months/new">
            <Plus className="size-4" />
            シフト月を作成
          </Link>
        </Button>
      </CardHeader>

      <CardContent className=" px-4">
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 ">
          {scheduleMonths.map((scheduleMonth) => (
            <Link
              key={scheduleMonth.label}
              href="/"
              className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-background px-3 py-4 text-sm transition-colors hover:border-primary/60 hover:bg-primary/5"
            >
              <span className="font-semibold">{scheduleMonth.label}</span>

              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              >
                {scheduleMonth.status}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentRequestsCard() {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-5 py-5">
        <CardTitle className="text-base">最近の申請（未処理）</CardTitle>

        <Link
          href="/admin/day-off-requests"
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          すべて見る
        </Link>
      </CardHeader>

      <CardContent className="px-5 pb-4">
        <div>
          {dayOffRequests.map((request, index) => (
            <div key={request.id}>
              <div className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {request.userName}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    申請日時：{request.submittedAt}
                  </p>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs">
                    {request.requestedDate}　{request.type}
                  </p>
                </div>

                <Badge className="shrink-0 bg-orange-100 text-orange-700 hover:bg-orange-100">
                  未対応
                </Badge>
              </div>

              {index < dayOffRequests.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FacilityManagementCard() {
  return (
    <Card className="h-fit self-start gap-0  py-0 shadow-none">
      <CardHeader className="px-5 py-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-5" />
          施設管理
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <div className="space-y-2">
          {facilityManagementItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.025]"
              >
                <Icon className="size-5 shrink-0 text-foreground" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TypeListCard({ title, href, unit, items }: TypeListCardProps) {
  return (
    <Card className="h-full gap-0 py-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-5 py-5">
        <CardTitle className="text-base">{title}</CardTitle>

        <Link
          href={href}
          className="text-xs font-medium text-primary hover:underline"
        >
          すべて見る
        </Link>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 text-sm">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span className="min-w-0 flex-1 truncate">{item.name}</span>

            <span className="shrink-0 text-muted-foreground">
              {item.count}
              {unit}
            </span>
          </div>
        ))}

        <p className="text-sm text-muted-foreground">…</p>
      </CardContent>
    </Card>
  );
}
