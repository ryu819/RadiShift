import { CalendarDays } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function MasterShiftEmpty() {
  return (
    <Empty>
      <EmptyHeader className="gap-2">
        <EmptyMedia variant="icon" className="size-10">
          <CalendarDays className="size-5" />
        </EmptyMedia>

        <EmptyTitle className="sm:text-lg">
          表示できるシフトがありません
        </EmptyTitle>

        <EmptyDescription className="sm:text-base">
          シフト月が作成されると、ここに全体シフトが表示されます。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
