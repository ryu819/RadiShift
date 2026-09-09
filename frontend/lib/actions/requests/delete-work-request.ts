"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import type { RailsResponse } from "@/types/rails-response";

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function deleteWorkRequestForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workRequestId = Number(formData.get("workRequestId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/work_requests/${workRequestId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {
        success: false,
        error: data.message,
      };
    }

    updateTag(CACHE_TAGS.pendingRequests);
    updateTag(CACHE_TAGS.workRequests);

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
