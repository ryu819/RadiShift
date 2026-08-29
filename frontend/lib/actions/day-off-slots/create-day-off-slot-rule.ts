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
    day_off_type_id?: string[];
    weekday?: string[];
    maxSlots?: string[];
  };
};

type CreateDayOffSlotRuleResponse = {
  message?: string;
  errors?: {
    day_off_type_id?: string[];
    weekday?: string[];
    maxSlots?: string[];
  };
};

export async function createDayOffSlotRuleForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dayOffTypeId = Number(formData.get("dayOffTypeId"));
  const weekday = Number(formData.get("weekday"));
  const maxSlots = Number(formData.get("maxSlots"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/day_off_slot_rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          dayOffSlotRule: {
            dayOffTypeId,
            weekday,
            maxSlots,
          },
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return { success: false };
    }

    const data: CreateDayOffSlotRuleResponse = camelcaseKeys(await res.json(), {
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

    return {
      success: false,
    };
  }
}
