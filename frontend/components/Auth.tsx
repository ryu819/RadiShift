import { auth } from "@/lib/actions/auth";

export async function Auth() {
  await auth();
  return null;
}
