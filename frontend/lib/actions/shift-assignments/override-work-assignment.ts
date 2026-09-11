"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import type { RailsResponse } from "@/types/rails-response";

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function overrideWorkAssignmentForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workAssignmentId = Number(formData.get("workAssignmentId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/work_assignments/${workAssignmentId}/override`,
      {
        method: "PATCH",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {
        success: false,
      };
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        success: false,
        error: data.message,
      };
    }

    refresh();

    return {
      success: true,
    };
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return {
      success: false,
    };
  }
}
