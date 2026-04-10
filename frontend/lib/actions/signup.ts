"use server";
import camelcaseKeys from "camelcase-keys";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

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

  const data: SignupError = camelcaseKeys(await res.json());

  if (!res.ok) {
    return {
      errors: data.errors,
      values: { name, email },
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(
    "flashToast",
    JSON.stringify({
      type: "pending",
      message: data.message,
    }),
    {
      path: "/",
      maxAge: 3,
    },
  );

  redirect("/");
}
