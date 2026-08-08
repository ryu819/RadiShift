import { FacilityManagementCard } from "@/components/admin/dashboard/overview/FacilityManagementCard";
import { PendingRequestsCard } from "@/components/admin/dashboard/overview/requests/PendingRequestsCard";
import { ScheduleMonthsCard } from "@/components/admin/dashboard/overview/schedule-months/ScheduleMonthsCard";
import { DeadlineSummaryCard } from "@/components/admin/dashboard/overview/summary/DeadlineSummaryCard";
import { MemberCountSummaryCard } from "@/components/admin/dashboard/overview/summary/MemberCountSummaryCard";
import { PendingRequestSummaryCard } from "@/components/admin/dashboard/overview/summary/PendingRequestSummaryCard";
import { PublishedScheduleMonthSummaryCard } from "@/components/admin/dashboard/overview/summary/PublishedScheduleMonthSummaryCard";
import { TypeSettingsCard } from "@/components/admin/dashboard/overview/TypeSettingsCard";

export function Overview() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PublishedScheduleMonthSummaryCard />

        <PendingRequestSummaryCard />

        <MemberCountSummaryCard />

        <DeadlineSummaryCard />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <ScheduleMonthsCard />

          <PendingRequestsCard />
        </div>

        <div className="space-y-5">
          <FacilityManagementCard />

          <TypeSettingsCard />
        </div>
      </div>
    </>
  );
}
