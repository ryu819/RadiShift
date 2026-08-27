import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/actions/jwt";
import { Member } from "@/types/member";

export async function getMembers() {
  "use cache: private";

  cacheTag(CACHE_TAGS.members);

  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/members`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: Member[] = camelcaseKeys(await res.json());

    return data;
  } catch {
    return null;
  }
}
