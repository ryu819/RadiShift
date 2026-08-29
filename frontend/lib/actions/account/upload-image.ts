"use server";

import { redirect } from "next/navigation";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type ImageResponse = {
  message?: string;
  errors?: string[];
};

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ERROR_MESSAGES = {
  INVALID_TYPE:
    "対応している画像形式（JPEG・PNG）のファイルを選択してください。",
  FILE_TOO_LARGE: "5MB以下の画像を選択してください。",
};

export async function uploadImage(formData: FormData) {
  const file = formData.get("avatarImage") as File;

  const jwt = await getJwt();
  if (!jwt) redirect("/");

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    await setFlashToast({
      type: "failure",
      message: ERROR_MESSAGES.INVALID_TYPE,
    });
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    await setFlashToast({
      type: "failure",
      message: ERROR_MESSAGES.FILE_TOO_LARGE,
    });
    return;
  }

  try {
    const body = new FormData();
    body.append("avatar_image", file);

    const res = await fetch(
      `${process.env.RAILS_API_URL}/current/user/avatar_image`,
      {
        method: "PATCH",
        headers: {
          Authorization: jwt,
        },
        body,
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });
      return;
    }

    const data: ImageResponse = await res.json();
    const errorMessage = data.errors?.join("\n");

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
        message: errorMessage,
      });
      return;
    }

    await setFlashToast({
      type: "success",
      message: data.message,
    });
  } catch {
    await setFlashToast({
      type: "failure",
    });
  }
}
