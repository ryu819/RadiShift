"use server";

import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  errors?: {
    monthlyDaysOff?: string[];
    status?: string[];
  };
};

type UpdateScheduleMonthResponse = {
  message: string;
  errors?: {
    monthlyDaysOff?: string[];
    status?: string[];
  };
};

export async function updateScheduleMonthForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleMonthId = Number(formData.get("scheduleMonthId"));
  const monthlyDaysOff = Number(formData.get("monthlyDaysOff"));
  const status = formData.get("status") as string;

  const jwt = await getJwt();
  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/schedule_months/${scheduleMonthId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            scheduleMonth: {
              monthlyDaysOff,
              status,
            },
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: UpdateScheduleMonthResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return { success: false, errors: data.errors };
    }

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
