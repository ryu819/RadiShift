"use server";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { Facility } from "@/types/facility";

export async function getFacility() {
  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/facility`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: Facility = camelcaseKeys(await res.json());

    return data;
  } catch {
    return null;
  }
}
