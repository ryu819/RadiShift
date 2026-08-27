import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import { DayOffAssignmentsByUserAndDay } from "@/types/day-off-assignment";
import { WorkAssignmentsByUserAndDay } from "@/types/work-assignment";

type MasterShiftResponse = {
  workAssignmentsByUserAndDay: WorkAssignmentsByUserAndDay;
  dayOffAssignmentsByUserAndDay: DayOffAssignmentsByUserAndDay;
};

export async function getMasterShiftAssignments(year: number, month: number) {
  "use cache: private";

  cacheTag(CACHE_TAGS.masterShifts, CACHE_TAGS.masterShift(year, month));

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
