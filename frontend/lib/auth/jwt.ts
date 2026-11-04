import "server-only";

import { cookies } from "next/headers";

export async function hasJwt() {
  const cookieStore = await cookies();
  return cookieStore.has("jwt");
}

export async function getJwt() {
  const cookieStore = await cookies();
  return cookieStore.get("jwt")?.value;
}

export async function deleteJwt() {
  const cookieStore = await cookies();
  cookieStore.delete("jwt");
}

export async function setJwt(jwt: string | null) {
  if (!jwt) return;

  const cookieStore = await cookies();

  cookieStore.set("jwt", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}
