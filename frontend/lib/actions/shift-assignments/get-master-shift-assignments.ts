import "server-only";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { DayOffAssignmentsByUserAndDay } from "@/types/day-off-assignment";
import { WorkAssignmentsByUserAndDay } from "@/types/work-assignment";

type MasterShiftResponse = {
  workAssignmentsByUserAndDay: WorkAssignmentsByUserAndDay;
  dayOffAssignmentsByUserAndDay: DayOffAssignmentsByUserAndDay;
};

export async function getMasterShiftAssignments(year: number, month: number) {
  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/admin/master_shift?year=${year}&month=${month}`,
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
