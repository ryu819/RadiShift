"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  errors?: {
    scheduleDayId?: string[];
    dayOffTypeId?: string[];
  };
};

type CreateDayOffRequestResponse = {
  message: string;
  errors?: {
    scheduleDayId?: string[];
    dayOffTypeId?: string[];
  };
};

export async function createDayOffRequestForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleDayId = Number(formData.get("scheduleDayId"));
  const dayOffTypeId = Number(formData.get("dayOffTypeId"));
  const isReturn = formData.get("isReturn") === "true";
  const scheduleMonthId = Number(formData.get("scheduleMonthId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/day_off_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          dayOffRequest: {
            scheduleDayId,
            dayOffTypeId,
            isReturn,
          },
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: CreateDayOffRequestResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure", message: data.message });
      return {
        success: false,
        errors: data.errors,
      };
    }

    updateTag(CACHE_TAGS.pendingRequests);
    updateTag(CACHE_TAGS.dayOffRequests);
    updateTag(CACHE_TAGS.scheduleMonth(scheduleMonthId));

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
