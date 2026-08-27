import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import type { DayOffType } from "@/types/day-off-type";

export async function getDayOffTypes() {
  "use cache: private";

  cacheTag(CACHE_TAGS.dayOffTypes);

  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/day_off_types`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: DayOffType[] = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
