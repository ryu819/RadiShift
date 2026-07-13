"use server";
import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { ScheduleMonth } from "@/types/schedule-month";

export async function getScheduleMonth(ScheduleMonthId: number) {
  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/schedule_months/${ScheduleMonthId}`,
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
