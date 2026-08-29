import { AccountUpdateForm } from "@/components/account-settings/AccountUpdateForm";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";

export async function AccountUpdateServer() {
  const user = await getCurrentUser();

  return <AccountUpdateForm user={user} />;
}
