import { cookies } from "next/headers";

const FLASH_TOAST_MAX_AGE = 3;
const SERVER_ERROR_MESSAGE =
  "現在サーバーで問題が発生しています。しばらくしてからもう一度お試しください。";

export type FlashToast = {
  type: "success" | "failure" | "pending";
  message?: string;
  id?: number;
};

export async function setFlashToast(data: FlashToast) {
  const toastData: FlashToast = {
    type: data.type,
    message: data.message ?? SERVER_ERROR_MESSAGE,
    id: Date.now(),
  };

  const cookieStore = await cookies();

  cookieStore.set("flashToast", JSON.stringify(toastData), {
    path: "/",
    maxAge: FLASH_TOAST_MAX_AGE,
  });
}
