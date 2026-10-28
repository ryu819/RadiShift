"use server";

import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  values: {
    email?: string;
  };
};

type ResendConfirmationResponse = {
  message: string;
};

// 認証メールの再送を依頼する。
// APIは登録の有無に関わらず同じメッセージを返すため、画面も成功時は常にその文言を表示する。
export async function resendConfirmation(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email,
        },
      }),
    });

    if (!res.ok) {
      await setFlashToast({ type: "failure" });
      return { success: false, values: { email } };
    }

    const data: ResendConfirmationResponse = await res.json();

    await setFlashToast({ type: "pending", message: data.message });
    return { success: true, values: {} };
  } catch {
    await setFlashToast({ type: "failure" });
    return { success: false, values: { email } };
  }
}
