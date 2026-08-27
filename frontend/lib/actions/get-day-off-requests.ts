import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import type { DayOffRequest } from "@/types/day-off-request";

export async function getDayOffRequests() {
  "use cache: private";

  cacheTag(CACHE_TAGS.dayOffRequests);

  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/day_off_requests`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: DayOffRequest[] = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
