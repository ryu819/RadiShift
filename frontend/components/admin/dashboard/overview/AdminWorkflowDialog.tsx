"use client";

import { ChevronRight, CircleHelp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";

const workflowSteps = [
  {
    title: "シフト設定",
    description: "勤務・休み・モダリティの種類を設定します",
    href: ROUTES.adminShiftTypes,
  },
  {
    title: "休み枠設定",
    description: "曜日ごとの休み枠の基本ルールを設定します",
    href: ROUTES.adminDayOffSlots,
  },
  {
    title: "メンバー招待",
    description: "招待コードを使ってメンバーを追加します",
    href: ROUTES.adminMembers,
  },
  {
    title: "シフト表作成",
    description: "対象月と1人あたりの公休数を設定します",
    scrollTarget: "schedule-months",
  },
  {
    title: "全体シフトで編集",
    description: "勤務・休み・モダリティの割当を編集します",
    href: ROUTES.masterShift,
  },
  {
    title: "シフト表を公開",
    description: "シフト月の公開状態を「公開」に変更します",
    scrollTarget: "schedule-months",
  },
];

const itemClassName =
  "group flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60 active:bg-muted/60 cursor-pointer";

export function AdminWorkflowDialog() {
  const pathname = usePathname();

  const scrollToScheduleMonths = () => {
    document.getElementById("schedule-months")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-secondary">
        <CircleHelp className="size-4" />
        運用の流れ
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-2xl"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>シフト運用の流れ</DialogTitle>

          <DialogDescription>
            初期設定からシフト編集・公開までの基本的な流れです
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {workflowSteps.map((step, index) => {
            const content = (
              <>
                <div className="flex  items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{step.title}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="size-4  text-muted-foreground transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5" />
              </>
            );

            if (step.scrollTarget) {
              if (pathname === ROUTES.adminDashboard) {
                return (
                  <DialogClose
                    key={step.title}
                    className={itemClassName}
                    onClick={scrollToScheduleMonths}
                  >
                    {content}
                  </DialogClose>
                );
              }

              return (
                <DialogClose key={step.title} asChild>
                  <Link
                    href={`${ROUTES.adminDashboard}#schedule-months`}
                    className={itemClassName}
                  >
                    {content}
                  </Link>
                </DialogClose>
              );
            } else if (step.href)
              return (
                <DialogClose key={step.title} asChild>
                  <Link href={step.href} className={itemClassName}>
                    {content}
                  </Link>
                </DialogClose>
              );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
