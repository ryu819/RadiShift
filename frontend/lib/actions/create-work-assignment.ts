"use server";

import camelcaseKeys from "camelcase-keys";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  errors?: {
    scheduleDayId?: string[];
    userId?: string[];
    workTypeId?: string[];
  };
};

type CreateWorkAssignmentResponse = {
  message: string;
  errors: {
    scheduleDayId?: string[];
    userId?: string[];
    workTypeId?: string[];
  };
};

export async function createWorkAssignmentForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduleDayId = formData.get("scheduleDayId");
  const userId = formData.get("userId");
  const workTypeId = formData.get("workTypeId");

  const jwt = await getJwt();
  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/work_assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          workAssignment: {
            scheduleDayId,
            userId,
            workTypeId,
          },
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {};
    }

    const data: CreateWorkAssignmentResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        errors: data.errors,
      };
    }

    revalidatePath("/overview-shift");

    return {};
  } catch {
    await setFlashToast({ type: "failure" });

    return {};
  }
}
