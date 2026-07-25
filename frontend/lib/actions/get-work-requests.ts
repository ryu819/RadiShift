"use server";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import type { WorkRequest } from "@/types/work-request";

export async function getWorkRequests() {
  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/work_requests`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: WorkRequest[] = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
