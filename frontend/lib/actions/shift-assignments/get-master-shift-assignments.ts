import "server-only";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/auth/jwt";
import type { DayOffAssignmentsByUserAndDay } from "@/types/day-off-assignment";
import type { Member } from "@/types/member";
import type { ModalityAssignmentsByUserAndDay } from "@/types/modality-assignment";
import type { WorkAssignmentsByUserAndDay } from "@/types/work-assignment";

type MasterShiftResponse = {
  members: Member[];
  workAssignmentsByUserAndDay: WorkAssignmentsByUserAndDay;
  dayOffAssignmentsByUserAndDay: DayOffAssignmentsByUserAndDay;
  modalityAssignmentsByUserAndDay: ModalityAssignmentsByUserAndDay;
};

export async function getMasterShiftAssignments(scheduleMonthId: number) {
  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/master_shifts/${scheduleMonthId}`,
      {
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (!res.ok) return null;

    const data: MasterShiftResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
