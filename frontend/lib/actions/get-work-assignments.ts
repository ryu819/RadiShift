"use server";
import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { WorkAssignments } from "@/types/work-assignments";

export async function getWorkAssignments(year: number, month: number) {
  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/work_assignments?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (!res.ok) return null;

    const data: WorkAssignments[] = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
