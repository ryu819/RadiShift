"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";

export function AdminDashboardTabs({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();

  const activeTab = segment ?? "overview";

  return (
    <Tabs value={activeTab} activationMode="manual" className="space-y-6">
      <TabsList variant="line" className="w-full border-b">
        <TabsTrigger
          value="overview"
          asChild
          className="cursor-pointer text-secondary data-[state=active]:text-primary"
        >
          <Link href={`${ROUTES.adminDashboard}`} prefetch={true}>
            概要
          </Link>
        </TabsTrigger>

        <TabsTrigger
          value="members"
          asChild
          className="cursor-pointer text-secondary data-[state=active]:text-primary"
        >
          <Link href={`${ROUTES.adminMembers}`} prefetch={true}>
            メンバー
          </Link>
        </TabsTrigger>

        <TabsTrigger
          value="shift-types"
          asChild
          className="cursor-pointer text-secondary data-[state=active]:text-primary"
        >
          <Link href={`${ROUTES.adminShiftTypes}`} prefetch={true}>
            シフト設定
          </Link>
        </TabsTrigger>

        <TabsTrigger
          value="day-off-slots"
          asChild
          className="cursor-pointer text-secondary data-[state=active]:text-primary"
        >
          <Link href={`${ROUTES.adminDayOffSlots}`} prefetch={true}>
            休み枠
          </Link>
        </TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-5" value={activeTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
}
