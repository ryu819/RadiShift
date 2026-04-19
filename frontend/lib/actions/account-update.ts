"use server";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
type AccountUpdateResponse = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
  };
  confirmation?: boolean;
};

type ActionState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  values: {
    name?: string;
    email?: string;
  };
};

export async function submitAccountUpdateForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  const jwt = await getJwt();
  if (!jwt)
    return {
      errors: {},
      values: { name, email },
    };

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/current/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify({
        user: {
          name,
          email,
        },
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

    const data: AccountUpdateResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        errors: data.errors,
        values: { name, email },
      };
    }

    if (data.confirmation) {
      await setFlashToast({ type: "pending", message: data.message });
    } else {
      await setFlashToast({ type: "success", message: data.message });
    }

    return {
      errors: {},
      values: { name, email },
    };
  } catch {
    await setFlashToast({ type: "failure" });
    return {
      errors: {},
      values: { name, email },
    };
  }
}
