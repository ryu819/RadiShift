"use server";

import camelcaseKeys from "camelcase-keys";
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
    year?: string[];
    month?: string[];
    monthlyDaysOff?: string[];
  };
};

type CreateScheduleMonthResponse = {
  message: string;
  errors?: {
    year?: string[];
    month?: string[];
    monthlyDaysOff?: string[];
  };
};

export async function createScheduleMonthForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const yearAndMonth = formData.get("yearAndMonth") as string;
  const [yearText, monthText] = yearAndMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const monthlyDaysOff = Number(formData.get("monthlyDaysOff"));

  const jwt = await getJwt();
  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/schedule_months`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          scheduleMonth: {
            year,
            month,
            monthlyDaysOff,
          },
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: CreateScheduleMonthResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    updateTag(CACHE_TAGS.scheduleMonths);

    return {
      success: true,
    };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
