import { cookies } from "next/headers";

import { FlashToaster } from "@/components/toast/FlashToaster";

export async function FlashToastServer() {
  const flash = (await cookies()).get("flashToast")?.value;

  return <FlashToaster flash={flash} />;
}
