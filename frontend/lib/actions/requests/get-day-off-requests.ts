import "server-only";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/auth/jwt";
import type { DayOffRequest } from "@/types/day-off-request";

export async function getDayOffRequests() {
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
