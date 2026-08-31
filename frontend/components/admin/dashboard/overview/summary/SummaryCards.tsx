import { CalendarCheck2, FileText, Users } from "lucide-react";
import { Suspense } from "react";

import { getFacility } from "@/lib/actions/facility/get-facility";
import { getMembers } from "@/lib/actions/members/get-members";
import { getPendingRequests } from "@/lib/actions/requests/get-pending-requests";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";

import { DeadlineSummaryCard } from "./DeadlineSummaryCard";
import { MemberCountSummaryCard } from "./MemberCountSummaryCard";
import { PendingRequestSummaryCard } from "./PendingRequestSummaryCard";
import { PublishedScheduleMonthSummaryCard } from "./PublishedScheduleMonthSummaryCard";
import {
  DeadlineSummaryCardSkeleton,
  SummaryCardSkeleton,
} from "./SummaryCardsSkeleton";

export function SummaryCards() {
  return (
    <>
      <Suspense
        fallback={
          <SummaryCardSkeleton
            icon={<CalendarCheck2 className="size-6 text-primary" />}
            title="公開シフト月"
          />
        }
      >
        <PublishedScheduleMonthSummary />
      </Suspense>

      <Suspense
        fallback={
          <SummaryCardSkeleton
            icon={<FileText className="size-6 text-primary" />}
            title="未処理の申請"
          />
        }
      >
        <PendingRequestSummary />
      </Suspense>

      <Suspense
        fallback={
          <SummaryCardSkeleton
            icon={<Users className="size-6 text-primary" />}
            title="メンバー数"
          />
        }
      >
        <MemberCountSummary />
      </Suspense>

      <Suspense fallback={<DeadlineSummaryCardSkeleton />}>
        <DeadlineSummary />
      </Suspense>
    </>
  );
}

async function PublishedScheduleMonthSummary() {
  const scheduleMonths = await getScheduleMonths();

  return (
    <PublishedScheduleMonthSummaryCard count={scheduleMonths?.length ?? 0} />
  );
}

async function PendingRequestSummary() {
  const pendingRequests = await getPendingRequests();

  return <PendingRequestSummaryCard count={pendingRequests?.length ?? 0} />;
}

async function MemberCountSummary() {
  const members = await getMembers();

  return <MemberCountSummaryCard count={members?.length ?? 0} />;
}

async function DeadlineSummary() {
  const facility = await getFacility();

  return (
    <DeadlineSummaryCard
      month={facility?.nextRequestDeadline.month}
      daysRemaining={facility?.nextRequestDeadline.daysRemaining ?? 0}
    />
  );
}
