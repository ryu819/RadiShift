import { CalendarCheck2, CalendarClock, FileText, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCardsSkeleton() {
  return (
    <>
      <SummaryCardSkeleton
        icon={<CalendarCheck2 className="size-6 text-primary" />}
        title="公開シフト月"
      />

      <SummaryCardSkeleton
        icon={<FileText className="size-6 text-primary" />}
        title="未処理の申請"
      />

      <SummaryCardSkeleton
        icon={<Users className="size-6 text-primary" />}
        title="メンバー数"
      />

      <DeadlineSummaryCardSkeleton />
    </>
  );
}

type SummaryCardSkeletonProps = {
  icon: React.ReactNode;
  title: string;
};

export function SummaryCardSkeleton({ icon, title }: SummaryCardSkeletonProps) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          {icon}

          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>

        <div className="flex justify-center pt-5">
          <Skeleton className="h-9 w-18" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DeadlineSummaryCardSkeleton() {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <CalendarClock className="size-6 text-primary" />

          <div className="flex items-center">
            <Skeleton className="mr-1 h-4 w-4" />

            <span className="text-sm font-medium text-muted-foreground">
              月シフトの申請締切まで
            </span>
          </div>
        </div>

        <div className="flex justify-center pt-5">
          <Skeleton className="h-9 w-18" />
        </div>
      </CardContent>
    </Card>
  );
}
