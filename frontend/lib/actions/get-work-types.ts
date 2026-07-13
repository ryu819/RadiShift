"use server";
import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { WorkTypes } from "@/types/work-types";

export async function getWorkTypes() {
  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/work_types`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: WorkTypes[] = camelcaseKeys(await res.json());

    return data;
  } catch {
    return null;
  }
}
