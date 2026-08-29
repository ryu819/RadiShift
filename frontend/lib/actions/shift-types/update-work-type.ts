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
    colorCode?: string[];
  };
};

type UpdateWorkTypeResponse = {
  message?: string;
  errors?: {
    name?: string[];
    colorCode?: string[];
  };
};

export async function updateWorkTypeForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workTypeId = Number(formData.get("workTypeId"));
  const name = formData.get("name") as string;
  const colorCode = formData.get("colorCode") as string;
  const autoApprove = formData.get("autoApprove") === "true";

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/work_types/${workTypeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            workType: {
              name,
              colorCode,
              autoApprove,
            },
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: UpdateWorkTypeResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    updateTag(CACHE_TAGS.workTypes);

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
