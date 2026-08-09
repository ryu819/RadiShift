import { Users } from "lucide-react";
import { Suspense } from "react";

import { SummaryValueSkeleton } from "@/components/admin/dashboard/overview/summary/SummaryValueSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { getMembers } from "@/lib/actions/get-members";

export function MemberCountSummaryCard() {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <Users className="size-6 text-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            メンバー数
          </p>
        </div>
        <Suspense fallback={<SummaryValueSkeleton />}>
          <MemberCount />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function MemberCount() {
  const members = await getMembers();
  return (
    <div className="flex items-baseline justify-center gap-1.5 pt-5">
      <span className="text-3xl font-semibold">{members?.length}</span>

      <span className="text-base font-medium text-muted-foreground">名</span>
    </div>
  );
}
