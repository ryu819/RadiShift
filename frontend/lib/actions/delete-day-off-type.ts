"use server";

import { redirect } from "next/navigation";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function deleteDayOffTypeForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dayOffTypeId = Number(formData.get("dayOffTypeId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/day_off_types/${dayOffTypeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure" });
      return {
        success: false,
      };
    }

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}
