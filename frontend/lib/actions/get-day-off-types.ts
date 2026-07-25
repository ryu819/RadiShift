"use server";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import type { DayOffType } from "@/types/day-off-type";

export async function getDayOffTypes() {
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
