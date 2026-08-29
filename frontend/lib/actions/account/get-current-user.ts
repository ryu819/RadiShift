import "server-only";

import camelcaseKeys from "camelcase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { User } from "@/types/user";

export async function getCurrentUser() {
  const jwt = await getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/current/user`, {
      headers: {
        Authorization: jwt,
      },
    });

    if (!res.ok) return null;

    const data: User = camelcaseKeys(await res.json());

    return data;
  } catch {
    return null;
  }
}
