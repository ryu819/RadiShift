import { Settings2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDayOffTypes } from "@/lib/actions/get-day-off-types";
import { getModalityTypes } from "@/lib/actions/get-modality-types";
import { getWorkTypes } from "@/lib/actions/get-work-types";

export async function TypeSettingsCard() {
  const [workTypes, dayOffTypes, modalityTypes] = await Promise.all([
    getWorkTypes(),
    getDayOffTypes(),
    getModalityTypes(),
  ]);
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="size-5" />
          シフト設定
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
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
      </CardContent>
    </Card>
  );
}
