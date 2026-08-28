import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import type { DayOffSlotRule } from "@/types/day-off-slot-rule";

export async function getDayOffSlotRules() {
  "use cache: private";

  cacheLife("minutes");

  cacheTag(CACHE_TAGS.dayOffSlotRules);

  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/day_off_slot_rules`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: DayOffSlotRule[] = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
