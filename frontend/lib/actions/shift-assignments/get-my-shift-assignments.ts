import "server-only";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { DayOffAssignment } from "@/types/day-off-assignment";
import { WorkAssignment } from "@/types/work-assignment";

type MyShiftResponse = {
  workAssignments: WorkAssignment[];
  dayOffAssignments: DayOffAssignment[];
};

export async function getMyShiftAssignments(scheduleMonthId: number) {
  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/current/shifts/${scheduleMonthId}`,
      {
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (!res.ok) return null;

    const data: MyShiftResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
