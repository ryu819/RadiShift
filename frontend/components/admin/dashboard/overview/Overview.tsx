import { FacilityManagementCard } from "@/components/admin/dashboard/overview/FacilityManagementCard";
import { PendingRequestsCard } from "@/components/admin/dashboard/overview/requests/PendingRequestsCard";
import { ScheduleMonthsCard } from "@/components/admin/dashboard/overview/schedule-months/ScheduleMonthsCard";
import { SummaryCards } from "@/components/admin/dashboard/overview/summary/SummaryCards";
import { TypesCard } from "@/components/admin/dashboard/overview/TypesCard";

export function Overview() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCards />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <ScheduleMonthsCard />

          <PendingRequestsCard />
        </div>

        <div className="space-y-5">
          <FacilityManagementCard />

          <TypesCard />
        </div>
      </div>
    </>
  );
}
