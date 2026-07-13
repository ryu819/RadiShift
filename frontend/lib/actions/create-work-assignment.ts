"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  errors?: {
    schedule_day_id?: string[];
    user_id?: string[];
    work_type_id?: string[];
  };
};

type CreateWorkAssignmentResponse = {
  message: string;
  errors: {
    schedule_day_id?: string[];
    user_id?: string[];
    work_type_id?: string[];
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
      body: JSON.stringify({
        work_assignment: snakecaseKeys({
          scheduleDayId,
          userId,
          workTypeId,
        }),
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {};
    }

    const data: CreateWorkAssignmentResponse = await res.json();

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
