import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsCardSkeleton({ title }: { title: string }) {
  return (
    <Card className="gap-4 pt-5 pb-2 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>

        <CardAction>
          <Button variant="outline" disabled>
            追加
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="px-4">
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-3 rounded-full" />

                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              <Button variant="ghost" size="icon-sm" disabled>
                <MoreHorizontal />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ShiftTypesSkeleton() {
  return (
    <div className="grid gap-4 items-start lg:grid-cols-3">
      <SettingsCardSkeleton title="勤務タイプ" />

      <SettingsCardSkeleton title="休みタイプ" />

      <SettingsCardSkeleton title="モダリティ" />
    </div>
  );
}
