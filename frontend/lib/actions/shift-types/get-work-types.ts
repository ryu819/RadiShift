import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { WorkType } from "@/types/work-type";

export async function getWorkTypes() {
  "use cache: private";

  cacheLife("minutes");

  cacheTag(CACHE_TAGS.workTypes);

  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/work_types`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: WorkType[] = camelcaseKeys(await res.json());

    return data;
  } catch {
    return null;
  }
}
