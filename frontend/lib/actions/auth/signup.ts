"use server";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
type SignupResponse = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    passwordConfirmation?: string[];
  };
};

export type ActionState = {
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    passwordConfirmation?: string[];
  };
  values: {
    name?: string;
    email?: string;
  };
};

export async function submitSignupForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("passwordConfirmation") as string;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: snakecaseKeys({
          name,
          email,
          password,
          passwordConfirmation,
        }),
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {
        success: false,
        errors: {},
        values: { name, email },
      };
    }

    const data: SignupResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors,
        values: { name, email },
      };
    }

    await setFlashToast({ type: "pending", message: data.message });

    return { success: true, values: {} };
  } catch {
    await setFlashToast({ type: "failure" });
    return {
      success: false,
      errors: {},
      values: { name, email },
    };
  }
}
