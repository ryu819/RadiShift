"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { setJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

type ActionState = {
  error?: string;
};

export async function startDemo(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/demo_session`, {
      method: "POST",
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {};
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {};
    }

    await setJwt(res.headers.get("authorization"));

    await setFlashToast({
      type: "success",
      message: data.message,
    });
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return {};
  }

  redirect(ROUTES.masterShift);
}
