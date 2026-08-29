"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function deleteScheduleMonthForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleMonthId = Number(formData.get("scheduleMonthId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/schedule_months/${scheduleMonthId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return { success: false };
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
      });
      return {
        success: false,
        error: data.error,
      };
    }

    updateTag(CACHE_TAGS.scheduleMonths);
    updateTag(CACHE_TAGS.scheduleMonth(scheduleMonthId));

    return { success: true };
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return { success: false };
  }
}
