import { CalendarDays } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function MyShiftsEmpty() {
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
          シフト表がまだ作成されていません。管理者がシフト表を作成すると、マイシフトを利用できます。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
