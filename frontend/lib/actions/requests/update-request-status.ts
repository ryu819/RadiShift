"use server";

import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function updateRequestStatusForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requestId = Number(formData.get("requestId"));
  const requestKind = formData.get("requestKind") as string;
  const requestStatus = formData.get("requestStatus") as string;

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  const endpoint =
    requestKind === "work" ? "work_requests" : "day_off_requests";

  const requestBody =
    requestKind === "work"
      ? snakecaseKeys({
          workRequest: {
            requestStatus,
          },
        })
      : snakecaseKeys({
          dayOffRequest: {
            requestStatus,
          },
        });

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/${endpoint}/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure", message: data.message });
      return { success: false };
    }

    await setFlashToast({ type: "success", message: data.message });
    return { success: true };
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return { success: false };
  }
}
