import { List } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDayOffTypes } from "@/lib/actions/get-day-off-types";
import { getModalityTypes } from "@/lib/actions/get-modality-types";
import { getWorkTypes } from "@/lib/actions/get-work-types";

export function TypesCard() {
  return (
    <Card className="gap-4 pt-5 pb-2 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <List className="size-5" />
          シフト一覧
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<TypesSkeleton />}>
          <TypesRows />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function TypesRows() {
  const [workTypes, dayOffTypes, modalityTypes] = await Promise.all([
    getWorkTypes(),
    getDayOffTypes(),
    getModalityTypes(),
  ]);

  return (
    <div className="divide-y">
      <TypeRow title="勤務タイプ" items={workTypes ?? []} />

      <TypeRow title="休みタイプ" items={dayOffTypes ?? []} />

      <TypeRow title="モダリティ" items={modalityTypes ?? []} />
    </div>
  );
}

type TypeItem = {
  id: number;
  name: string;
  colorCode: string;
};

function TypeRow({ title, items }: { title: string; items: TypeItem[] }) {
  return (
    <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:gap-6">
      <h3 className="shrink-0 text-sm font-semibold">{title}</h3>

      <div className="flex flex-wrap">
        {items.length > 0 ? (
          <>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 text-sm"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: item.colorCode,
                  }}
                />

                <span>{item.name}</span>
              </div>
            ))}
          </>
        ) : (
          <p className="p-2 text-center text-sm text-muted-foreground">
            作成済みのシフトタイプはありません
          </p>
        )}
      </div>
    </div>
  );
}

function TypesSkeleton() {
  return (
    <div className="divide-y">
      <TypeRowSkeleton title="勤務タイプ" />

      <TypeRowSkeleton title="休みタイプ" />

      <TypeRowSkeleton title="モダリティ" />
    </div>
  );
}

type TypeRowSkeletonProps = {
  title: string;
};

function TypeRowSkeleton({ title }: TypeRowSkeletonProps) {
  return (
    <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:gap-6">
      <h3 className="shrink-0 text-sm font-semibold">{title}</h3>

      <div className="flex gap-3 px-2 py-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  );
}
