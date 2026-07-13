"use server";
import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { Member } from "@/types/member";

export async function getMembers() {
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
