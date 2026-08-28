import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import type { ScheduleMonth } from "@/types/schedule-month";

export async function getScheduleMonth(scheduleMonthId: number) {
  "use cache: private";

  cacheLife("minutes");

  cacheTag(CACHE_TAGS.scheduleMonth(scheduleMonthId));

  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/schedule_months/${scheduleMonthId}`,
      {
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (!res.ok) return null;

    const data: ScheduleMonth = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
