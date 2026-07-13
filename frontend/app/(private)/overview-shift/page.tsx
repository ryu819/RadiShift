import { Metadata } from "next";
import { Suspense } from "react";

import { OverviewServer } from "@/components/overview-shift/OverviewServer";
import { OverviewShiftLoading } from "@/components/overview-shift/OverviewShiftLoading";

export const metadata: Metadata = {
  title: "全体シフト",
};

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export default function OverviewPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<OverviewShiftLoading />}>
      <OverviewServer searchParams={searchParams} />
    </Suspense>
  );
}
