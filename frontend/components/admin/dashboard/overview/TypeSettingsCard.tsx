import { Settings2 } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDayOffTypes } from "@/lib/actions/get-day-off-types";
import { getModalityTypes } from "@/lib/actions/get-modality-types";
import { getWorkTypes } from "@/lib/actions/get-work-types";

export function TypeSettingsCard() {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="size-5" />
          シフト設定
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <Suspense fallback={<TypeSettingRowSkeleton title="勤務タイプ" />}>
          <WorkTypesRow />
        </Suspense>

        <Suspense fallback={<TypeSettingRowSkeleton title="休みタイプ" />}>
          <DayOffTypesRow />
        </Suspense>

        <Suspense fallback={<TypeSettingRowSkeleton title="モダリティ" />}>
          <ModalityTypesRow />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function WorkTypesRow() {
  const workTypes = await getWorkTypes();

  return (
    <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:gap-6 ">
      <h3 className="text-sm font-semibold shrink-0">勤務タイプ</h3>

      <div className="flex flex-wrap">
        {workTypes?.map((workType) => (
          <div
            key={workType.id}
            className="flex items-center gap-2 px-2 py-2 text-sm"
          >
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: workType.colorCode,
              }}
            />

            <span>{workType.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function DayOffTypesRow() {
  const dayOffTypes = await getDayOffTypes();

  return (
    <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:gap-6 ">
      <h3 className="text-sm font-semibold shrink-0">休みタイプ</h3>

      <div className="flex flex-wrap">
        {dayOffTypes?.map((dayOffType) => (
          <div
            key={dayOffType.id}
            className="flex items-center gap-2 px-2 py-2 text-sm"
          >
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: dayOffType.colorCode,
              }}
            />

            <span>{dayOffType.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function ModalityTypesRow() {
  const modalityTypes = await getModalityTypes();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 ">
      <h3 className="text-sm font-semibold shrink-0">モダリティ</h3>

      <div className="flex flex-wrap">
        {modalityTypes?.map((modalityType) => (
          <div
            key={modalityType.id}
            className="flex items-center gap-2 px-2 py-2 text-sm"
          >
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: modalityType.colorCode,
              }}
            />

            <span>{modalityType.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type TypeSettingRowSkeletonProps = {
  title: string;
};

function TypeSettingRowSkeleton({ title }: TypeSettingRowSkeletonProps) {
  return (
    <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:gap-6">
      <h3 className="shrink-0 text-sm font-semibold">{title}</h3>

      <div className="flex gap-3 px-2 py-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}
