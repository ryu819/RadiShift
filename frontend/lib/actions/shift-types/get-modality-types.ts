import "server-only";

import camelcaseKeys from "camelcase-keys";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import type { ModalityType } from "@/types/modality-type";

export async function getModalityTypes() {
  "use cache: private";

  cacheLife("minutes");

  cacheTag(CACHE_TAGS.modalityTypes);

  const jwt = await getJwt();

  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/modality_types`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: ModalityType[] = camelcaseKeys(await res.json(), {
      deep: true,
    });

    return data;
  } catch {
    return null;
  }
}
