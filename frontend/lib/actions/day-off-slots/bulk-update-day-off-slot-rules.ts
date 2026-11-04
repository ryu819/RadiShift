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
  errors?: Record<string, string[]>;
};

type BulkUpdateDayOffSlotRulesResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function bulkUpdateDayOffSlotRulesForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dayOffTypeId = Number(formData.get("dayOffTypeId"));
  const weekdays = formData.getAll("weekday");
  const maxSlots = formData.getAll("maxSlots");

  const dayOffSlotRules = weekdays.map((weekday, index) => ({
    weekday: Number(weekday),
    maxSlots: Number(maxSlots[index]),
  }));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/day_off_slot_rules/bulk_update`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            dayOffTypeId,
            dayOffSlotRules,
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: BulkUpdateDayOffSlotRulesResponse = camelcaseKeys(
      await res.json(),
      { deep: true },
    );

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure", message: data.message });
      return {
        success: false,
        errors: data.errors,
      };
    }

    updateTag(CACHE_TAGS.dayOffSlotRules);

    await setFlashToast({ type: "success", message: data.message });

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
