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
    name?: string[];
    dayOffUnit?: string[];
    colorCode?: string[];
  };
};

type UpdateDayOffTypeResponse = {
  message?: string;
  errors?: {
    name?: string[];
    dayOffUnit?: string[];
    colorCode?: string[];
  };
};

export async function updateDayOffTypeForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dayOffTypeId = Number(formData.get("dayOffTypeId"));
  const name = formData.get("name") as string;
  const colorCode = formData.get("colorCode") as string;
  const dayOffUnit = Number(formData.get("dayOffUnit"));
  const usesSlot = formData.get("usesSlot") === "true";

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/day_off_types/${dayOffTypeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            dayOffType: {
              name,
              dayOffUnit,
              colorCode,
              usesSlot,
            },
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: UpdateDayOffTypeResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    updateTag(CACHE_TAGS.dayOffTypes);

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
