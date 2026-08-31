import { DayOffTypesSettingsCard } from "@/components/admin/dashboard/shift-types/day-off-types/DayOffTypesSettingsCard";
import { ModalityTypesSettingsCard } from "@/components/admin/dashboard/shift-types/modality-types/ModalityTypesSettingsCard";
import { WorkTypesSettingsCard } from "@/components/admin/dashboard/shift-types/work-types/WorkTypesSettingsCard";
import { getDayOffTypes } from "@/lib/actions/shift-types/get-day-off-types";
import { getModalityTypes } from "@/lib/actions/shift-types/get-modality-types";
import { getWorkTypes } from "@/lib/actions/shift-types/get-work-types";

export async function ShiftTypes() {
  const [workTypes, dayOffTypes, modalityTypes] = await Promise.all([
    getWorkTypes(),
    getDayOffTypes(),
    getModalityTypes(),
  ]);

  return (
    <div className="grid gap-4 items-start lg:grid-cols-3">
      <WorkTypesSettingsCard workTypes={workTypes ?? []} />

      <DayOffTypesSettingsCard dayOffTypes={dayOffTypes ?? []} />

      <ModalityTypesSettingsCard modalityTypes={modalityTypes ?? []} />
    </div>
  );
}
