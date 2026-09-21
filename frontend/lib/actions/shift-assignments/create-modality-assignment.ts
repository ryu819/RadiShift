"use server";

import camelcaseKeys from "camelcase-keys";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  errors?: {
    scheduleDayId?: string[];
    userId?: string[];
    modalityTypeId?: string[];
  };
};

type Response = {
  message: string;
  errors?: {
    scheduleDayId?: string[];
    userId?: string[];
    modalityTypeId?: string[];
  };
};

export async function createModalityAssignmentForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleDayId = Number(formData.get("scheduleDayId"));
  const userId = Number(formData.get("userId"));
  const modalityTypeId = Number(formData.get("modalityTypeId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/modality_assignments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            modalityAssignment: {
              scheduleDayId,
              userId,
              modalityTypeId,
            },
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {};
    }

    const data: Response = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
        message: data.message,
      });

      return {
        errors: data.errors,
      };
    }

    refresh();

    return {};
  } catch {
    await setFlashToast({ type: "failure" });

    return {};
  }
}
