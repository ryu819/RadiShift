import { cookies } from "next/headers";

const FLASH_TOAST_MAX_AGE = 3;
const SERVER_ERROR_MESSAGE =
  "現在サーバーで問題が発生しています。しばらくしてからもう一度お試しください。";

export type FlashToast = {
  type: "success" | "failure" | "pending";
  message?: string;
};

export async function setFlashToast(data: FlashToast) {
  const cookieStore = await cookies();
  if (data.message) {
    cookieStore.set("flashToast", JSON.stringify(data), {
      path: "/",
      maxAge: FLASH_TOAST_MAX_AGE,
    });
  } else {
    cookieStore.set(
      "flashToast",
      JSON.stringify({
        type: "failure",
        message: SERVER_ERROR_MESSAGE,
      }),
      {
        path: "/",
        maxAge: FLASH_TOAST_MAX_AGE,
      },
    );
  }
}
