import { LoginForm } from "@/components/header/LoginForm";
import { SignUpForm } from "@/components/header/SignupForm";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";

import { UserDropdownMenu } from "./UserDropdownMenu";

export async function HeaderAuthSection() {
  const user = await getCurrentUser();

  return user ? (
    <UserDropdownMenu user={user} />
  ) : (
    <>
      <SignUpForm />
      <LoginForm />
    </>
  );
}
