import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import type { ScheduleMonths } from "@/types/schedule-months";

export async function getMasterShiftScheduleMonths() {
  "use cache: private";

  cacheLife("minutes");

  cacheTag(CACHE_TAGS.scheduleMonths);

  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/master_shifts`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: ScheduleMonths[] = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
