"use server";
import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/setFlashToast";
type SignupError = {
  message: string;
  errors: {
    name?: string[];
    email?: string[];
    password?: string[];
    passwordConfirmation?: string[];
  };
};

type ActionState = {
  errors: {
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
      errors: {},
      values: { name, email },
    };
  }

  const data: SignupError = camelcaseKeys(await res.json());

  if (isClientError(res.status)) {
    return {
      errors: data.errors,
      values: { name, email },
    };
  }

  await setFlashToast({ type: "pending", message: data.message });

  redirect("/");
}
