"use server";

import camelcaseKeys from "camelcase-keys";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  errors?: {
    scheduleDayId?: string[];
    userId?: string[];
    dayOffTypeId?: string[];
  };
};

type CreateDayOffAssignmentResponse = {
  message: string;
  errors: {
    scheduleDayId?: string[];
    userId?: string[];
    dayOffTypeId?: string[];
  };
};

export async function createDayOffAssignmentForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleDayId = formData.get("scheduleDayId");
  const userId = formData.get("userId");
  const dayOffTypeId = formData.get("dayOffTypeId");

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/day_off_assignments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            dayOffAssignment: {
              scheduleDayId,
              userId,
              dayOffTypeId,
            },
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {};
    }

    const data: CreateDayOffAssignmentResponse = camelcaseKeys(
      await res.json(),
      { deep: true },
    );

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { errors: data.errors };
    }

    refresh();

    return {};
  } catch {
    await setFlashToast({ type: "failure" });

    return {};
  }
}
