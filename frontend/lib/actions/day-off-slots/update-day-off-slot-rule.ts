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
    maxSlots?: string[];
  };
};

type UpdateDayOffSlotRuleResponse = {
  message?: string;
  errors?: {
    maxSlots?: string[];
  };
};

export async function updateDayOffSlotRuleForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dayOffSlotRuleId = Number(formData.get("dayOffSlotRuleId"));
  const maxSlots = Number(formData.get("maxSlots"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/day_off_slot_rules/${dayOffSlotRuleId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            dayOffSlotRule: {
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

    const data: UpdateDayOffSlotRuleResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    updateTag(CACHE_TAGS.dayOffSlotRules);

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
