"use server";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import type { ModalityType } from "@/types/modality-type";

export async function getModalityTypes() {
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
