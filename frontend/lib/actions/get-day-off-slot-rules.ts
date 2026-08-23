"use server";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import type { DayOffSlotRule } from "@/types/day-off-slot-rule";

export async function getDayOffSlotRules() {
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
