"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

type ActionState = {
  error?: string;
};

export async function deleteWorkAssignmentForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  const workAssignmentId = Number(formData.get("workAssignmentId"));

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/work_assignments/${workAssignmentId}`,
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
      });
      return {
        error: data.error,
      };
    }

    revalidatePath(`${ROUTES.masterShift}`);

    return {};
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return {};
  }
}
