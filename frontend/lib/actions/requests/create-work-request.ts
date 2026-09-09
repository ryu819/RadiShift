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
    workTypeId?: string[];
  };
};

type CreateWorkRequestResponse = {
  message: string;
  errors?: {
    scheduleDayId?: string[];
    workTypeId?: string[];
  };
};

export async function createWorkRequestForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleDayId = Number(formData.get("scheduleDayId"));
  const workTypeId = Number(formData.get("workTypeId"));
  const isReturn = formData.get("isReturn") === "true";
  const scheduleMonthId = Number(formData.get("scheduleMonthId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/work_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          workRequest: {
            scheduleDayId,
            workTypeId,
            isReturn,
          },
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: CreateWorkRequestResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure", message: data.message });
      return {
        success: false,
        errors: data.errors,
      };
    }

    updateTag(CACHE_TAGS.pendingRequests);
    updateTag(CACHE_TAGS.workRequests);
    updateTag(CACHE_TAGS.scheduleMonth(scheduleMonthId));

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
