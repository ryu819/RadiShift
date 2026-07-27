import { LayoutDashboard } from "lucide-react";
import { Suspense } from "react";

import { DeadlineSummaryCard } from "@/components/admin/dashboard/DeadlineSummaryCard";
import { FacilityManagementCard } from "@/components/admin/dashboard/FacilityManagementCard";
import { MemberCountSummaryCard } from "@/components/admin/dashboard/MemberCountSummaryCard";
import { PendingRequestSummaryCard } from "@/components/admin/dashboard/PendingRequestSummaryCard";
import { PublishedScheduleMonthSummaryCard } from "@/components/admin/dashboard/PublishedScheduleMonthSummaryCard";
import { RecentRequestsCard } from "@/components/admin/dashboard/RecentRequestsCard";
import { ScheduleMonthsCard } from "@/components/admin/dashboard/ScheduleMonthsCard";
import { TypeSettingsCard } from "@/components/admin/dashboard/TypeSettingsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminDashboard() {
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
              <Suspense>
                <PublishedScheduleMonthSummaryCard />
              </Suspense>

              <Suspense>
                <PendingRequestSummaryCard />
              </Suspense>

              <Suspense>
                <MemberCountSummaryCard />
              </Suspense>

              <Suspense>
                <DeadlineSummaryCard />
              </Suspense>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
                <Suspense>
                  <ScheduleMonthsCard />
                </Suspense>

                <Suspense>
                  <RecentRequestsCard />
                </Suspense>
              </div>

              <div className="space-y-5">
                <FacilityManagementCard />

                <Suspense>
                  <TypeSettingsCard />
                </Suspense>
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
