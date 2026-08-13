"use server";

import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  errors?: {
    rulesText?: string[];
  };
};

type updateMemberRulesResponse = {
  message: string;
  errors?: {
    rulesText?: string[];
  };
};

export async function updateMemberRulesForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const memberId = Number(formData.get("memberId"));
  const rulesText = String(formData.get("rulesText")).trim();

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/members/${memberId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: jwt,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          snakecaseKeys({
            user: {
              rulesText: rulesText || null,
            },
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: updateMemberRulesResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors ?? {
          rulesText: ["個別ルールの更新に失敗しました。"],
        },
      };
    }

    return { success: true };
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return { success: false };
  }
}
