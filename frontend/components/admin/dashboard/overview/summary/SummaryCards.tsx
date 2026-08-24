import { DeadlineSummaryCard } from "@/components/admin/dashboard/overview/summary/DeadlineSummaryCard";
import { MemberCountSummaryCard } from "@/components/admin/dashboard/overview/summary/MemberCountSummaryCard";
import { PendingRequestSummaryCard } from "@/components/admin/dashboard/overview/summary/PendingRequestSummaryCard";
import { PublishedScheduleMonthSummaryCard } from "@/components/admin/dashboard/overview/summary/PublishedScheduleMonthSummaryCard";
import { getFacility } from "@/lib/actions/get-facility";
import { getMembers } from "@/lib/actions/get-members";
import { getPendingRequests } from "@/lib/actions/get-pending-requests";
import { getScheduleMonths } from "@/lib/actions/get-schedule-months";

export async function SummaryCards() {
  const [scheduleMonths, pendingRequests, members, facility] =
    await Promise.all([
      getScheduleMonths(),
      getPendingRequests(),
      getMembers(),
      getFacility(),
    ]);

  return (
    <>
      <PublishedScheduleMonthSummaryCard count={scheduleMonths?.length ?? 0} />

      <PendingRequestSummaryCard count={pendingRequests?.length ?? 0} />

      <MemberCountSummaryCard count={members?.length ?? 0} />

      <DeadlineSummaryCard
        month={facility?.nextRequestDeadline.month}
        daysRemaining={facility?.nextRequestDeadline.daysRemaining ?? 0}
      />
    </>
  );
}
