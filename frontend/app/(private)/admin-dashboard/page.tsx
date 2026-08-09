import { LayoutDashboard } from "lucide-react";
import { Metadata } from "next";

import { Members } from "@/components/admin/dashboard/members/Members";
import { Overview } from "@/components/admin/dashboard/overview/Overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "管理画面TOP",
};

export default function AdminDashboardPage() {
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
              value="members"
              className="cursor-pointer text-secondary data-[state=active]:text-primary"
            >
              メンバー
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
            <Overview />
          </TabsContent>

          <TabsContent value="members">
            <Members />
          </TabsContent>

          <TabsContent value="types"></TabsContent>

          <TabsContent value="dayOffSlots"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
