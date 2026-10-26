"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

export async function deleteAvatarImage() {
  const jwt = await getJwt();
  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/current/user/avatar_image`,
      {
        method: "DELETE",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });
      return;
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure", message: data.message });
      return;
    }

    await setFlashToast({ type: "success", message: data.message });

    updateTag(CACHE_TAGS.members);
  } catch {
    await setFlashToast({ type: "failure" });
  }
}
