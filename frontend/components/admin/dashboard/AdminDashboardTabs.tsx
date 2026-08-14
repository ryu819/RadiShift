"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminDashboardTabs({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();

  const activeTab = segment ?? "overview";

  const handleTabChange = (tab: string) => {
    if (tab === "overview") {
      router.push("/admin-dashboard");
      return;
    }

    router.push(`/admin-dashboard/${tab}`);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      <TabsList variant="line" className="w-full border-b">
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
          value="shift-types"
          className="cursor-pointer text-secondary data-[state=active]:text-primary"
        >
          シフト設定
        </TabsTrigger>

        <TabsTrigger
          value="day-off-slots"
          className="cursor-pointer text-secondary data-[state=active]:text-primary"
        >
          休み枠
        </TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-5" value={activeTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
}
