import { AccountUpdateForm } from "@/components/AccountUpdateForm";
import { getCurrentUser } from "@/lib/actions/get-current-user";

export async function AccountUpdateServer() {
  const user = await getCurrentUser();

  return <AccountUpdateForm user={user} />;
}
