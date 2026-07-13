"use server";
import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { ScheduleMonths } from "@/types/schedule-months";

export async function getScheduleMonths() {
  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/schedule_months`, {
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
