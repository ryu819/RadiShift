"use server";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type ActionState = {
  error: string;
  value: string;
};

type JoinFacilityError = {
  message: string;
};

export async function joinFacilityForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const inviteCode = formData.get("inviteCode") as string;
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/facility/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          inviteCode,
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {
        error: "",
        value: inviteCode,
      };
    }

    const data: JoinFacilityError = await res.json();

    if (isClientError(res.status)) {
      return {
        error: "",
        value: inviteCode,
      };
    }

    await setFlashToast({ type: "success", message: data.message });
  } catch {
    await setFlashToast({ type: "failure" });
    return {
      error: "",
      value: "",
    };
  }

  redirect("/dashboard");
}
