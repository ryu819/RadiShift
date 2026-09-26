import { LayoutDashboard } from "lucide-react";

import { AdminDashboardTabs } from "@/components/admin/dashboard/AdminDashboardTabs";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 justify-center  p-3 md:p-8">
      <div className="w-full space-y-6">
        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
          <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>管理画面TOP</span>
        </div>

        <AdminDashboardTabs>{children}</AdminDashboardTabs>
      </div>
    </div>
  );
}
