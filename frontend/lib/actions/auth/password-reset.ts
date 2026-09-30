"use server";

import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { ROUTES } from "@/constants/routes";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
type PasswordResetResponse = {
  message: string;
  errors?: {
    password?: string;
    passwordConfirmation?: string;
    resetPasswordToken?: string;
  };
};

type ActionState = {
  errors?: {
    password?: string;
    passwordConfirmation?: string;
    resetPasswordToken?: string;
  };
};

export async function submitPasswordResetForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("passwordConfirmation") as string;
  const resetPasswordToken = formData.get("resetPasswordToken") as string;

  const jwt = await getJwt();

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: snakecaseKeys({
          password,
          passwordConfirmation,
          resetPasswordToken,
        }),
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {
        errors: {},
      };
    }

    const data: PasswordResetResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        errors: data.errors,
      };
    }

    await setFlashToast({ type: "success", message: data.message });
  } catch {
    await setFlashToast({ type: "failure" });
    return {
      errors: {},
    };
  }

  if (jwt) {
    redirect(ROUTES.settings);
  }

  redirect("/");
}
