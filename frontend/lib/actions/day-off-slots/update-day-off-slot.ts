"use server";

import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  errors?: {
    maxSlots?: string[];
  };
};

type UpdateDayOffSlotResponse = {
  message?: string;
  errors?: {
    maxSlots?: string[];
  };
};

export async function updateDayOffSlotForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dayOffSlotId = Number(formData.get("dayOffSlotId"));
  const maxSlots = Number(formData.get("maxSlots"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/day_off_slots/${dayOffSlotId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            dayOffSlot: {
              maxSlots,
            },
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: UpdateDayOffSlotResponse = camelcaseKeys(await res.json(), {
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
