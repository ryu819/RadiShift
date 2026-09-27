import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROUTES } from "@/constants/routes";

export function MasterShiftsEmpty({ isAdmin }: { isAdmin: boolean }) {
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
          {isAdmin
            ? "シフト表がまだ作成されていません。シフト表を作成すると、全体シフトを編集できます。"
            : "管理者がシフトを公開すると、全体シフトが表示されます。"}
        </EmptyDescription>
      </EmptyHeader>

      {isAdmin && (
        <EmptyContent>
          <Link
            href={`${ROUTES.adminDashboard}#schedule-months`}
            className="group flex items-center gap-1 text-sm font-medium text-primary hover:opacity-70"
          >
            シフト表を作成
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5  group-active:translate-x-0.5" />
          </Link>
        </EmptyContent>
      )}
    </Empty>
  );
}
