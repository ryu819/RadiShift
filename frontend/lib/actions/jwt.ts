"use server";
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
