import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import type { WorkRequest } from "@/types/work-request";

export async function getWorkRequests() {
  "use cache: private";

  cacheTag(CACHE_TAGS.workRequests);

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
