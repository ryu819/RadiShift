"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

export async function reorderMembers(memberIds: number[]): Promise<void> {
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/members/reorder`, {
      method: "PATCH",
      headers: {
        Authorization: jwt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        snakecaseKeys({
          memberIds,
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });
      return;
    }

    if (isClientError(res.status)) {
      const data: RailsResponse = await res.json();
      await setFlashToast({ type: "failure", message: data.message });
      return;
    }

    updateTag(CACHE_TAGS.members);

    return;
  } catch {
    await setFlashToast({ type: "failure" });
    return;
  }
}
