import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import { Facility } from "@/types/facility";

export async function getFacility() {
  "use cache: private";

  cacheLife("minutes");

  cacheTag(CACHE_TAGS.facility);

  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/facility`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: Facility = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
