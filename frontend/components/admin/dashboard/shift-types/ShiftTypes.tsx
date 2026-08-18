import { DayOffTypeSettingsCard } from "@/components/admin/dashboard/shift-types/day-off-types/DayOffTypeSettingsCard";
import { ModalityTypeSettingsCard } from "@/components/admin/dashboard/shift-types/modality-types/ModalityTypeSettingsCard";
import { WorkTypeSettingsCard } from "@/components/admin/dashboard/shift-types/work-types/WorkTypeSettingsCard";
import { getDayOffTypes } from "@/lib/actions/get-day-off-types";
import { getModalityTypes } from "@/lib/actions/get-modality-types";
import { getWorkTypes } from "@/lib/actions/get-work-types";

export async function ShiftTypes() {
  const [workTypes, dayOffTypes, modalityTypes] = await Promise.all([
    getWorkTypes(),
    getDayOffTypes(),
    getModalityTypes(),
  ]);

  return (
    <div className="grid gap-4 items-start lg:grid-cols-3">
      <WorkTypeSettingsCard workTypes={workTypes ?? []} />

      <DayOffTypeSettingsCard dayOffTypes={dayOffTypes ?? []} />

      <ModalityTypeSettingsCard modalityTypes={modalityTypes ?? []} />
    </div>
  );
}
