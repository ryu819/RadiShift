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
    day_off_type_id?: string[];
    weekday?: string[];
    maxSlots?: string[];
  };
};

type CreateDayOffSlotResponse = {
  message?: string;
  errors?: {
    day_off_type_id?: string[];
    weekday?: string[];
    maxSlots?: string[];
  };
};

export async function createDayOffSlotForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleDayId = Number(formData.get("scheduleDayId"));
  const dayOffTypeId = Number(formData.get("dayOffTypeId"));
  const maxSlots = Number(formData.get("maxSlots"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/day_off_slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          dayOffSlot: {
            scheduleDayId,
            dayOffTypeId,
            maxSlots,
          },
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: CreateDayOffSlotResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
