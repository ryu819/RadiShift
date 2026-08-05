import { DeadlineSummaryCard } from "@/components/admin/dashboard/DeadlineSummaryCard";
import { FacilityManagementCard } from "@/components/admin/dashboard/FacilityManagementCard";
import { MemberCountSummaryCard } from "@/components/admin/dashboard/MemberCountSummaryCard";
import { PendingRequestSummaryCard } from "@/components/admin/dashboard/PendingRequestSummaryCard";
import { PublishedScheduleMonthSummaryCard } from "@/components/admin/dashboard/PublishedScheduleMonthSummaryCard";
import { PendingRequestsCard } from "@/components/admin/dashboard/requests/PendingRequestsCard";
import { ScheduleMonthsCard } from "@/components/admin/dashboard/schedule-months/ScheduleMonthsCard";
import { TypeSettingsCard } from "@/components/admin/dashboard/TypeSettingsCard";

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
