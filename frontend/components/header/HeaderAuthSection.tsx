import { LoginForm } from "@/components/header/login/LoginForm";
import { SignUpForm } from "@/components/header/signup/SignupForm";
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
