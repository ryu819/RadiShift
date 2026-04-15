import { cookies } from "next/headers";

const FLASH_TOAST_MAX_AGE = 3;
const DEFAULT_ERROR_MESSAGE =
  "エラーが発生しました。しばらくしてからもう一度お試しください。";
export type FlashToast = {
  type: "success" | "failure" | "pending";
  message?: string;
  id?: number;
};

export async function setFlashToast(data: FlashToast) {
  const toastData: FlashToast = {
    type: data.type,
    message: data.message ?? DEFAULT_ERROR_MESSAGE,
    id: Date.now(),
  };

  const cookieStore = await cookies();

  cookieStore.set("flashToast", JSON.stringify(toastData), {
    path: "/",
    maxAge: FLASH_TOAST_MAX_AGE,
  });
}
