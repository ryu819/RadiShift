import { auth } from "@/lib/auth/auth";

export async function Auth() {
  await auth();
  return null;
}
