"use server";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { FacilityInvitation } from "@/types/facility-invitation";

export async function getFacilityInvitation() {
  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/facility/invitation`,
      {
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (!res.ok) return null;

    const data: FacilityInvitation = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
