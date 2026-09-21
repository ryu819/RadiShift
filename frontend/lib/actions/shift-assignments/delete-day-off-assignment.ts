"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import type { RailsResponse } from "@/types/rails-response";

type ActionState = {
  error?: string;
};

export async function deleteDayOffAssignmentForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  const dayOffAssignmentId = Number(formData.get("dayOffAssignmentId"));

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/day_off_assignments/${dayOffAssignmentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {};
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
        message: data.message,
      });

      return {
        error: data.error,
      };
    }

    refresh();

    return {};
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return {};
  }
}
