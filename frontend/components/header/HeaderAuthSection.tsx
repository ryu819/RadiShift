import { LoginForm } from "@/components/header/LoginForm";
import { SignUpForm } from "@/components/header/SignupForm";
import { getCurrentUser } from "@/lib/actions/get-current-user";

import { UserDropdownMenu } from "./UserDropdownMenu";

export async function HeaderAuthSection() {
  const loggedIn = await getCurrentUser();

  return loggedIn ? (
    <UserDropdownMenu />
  ) : (
    <>
      <SignUpForm />
      <LoginForm />
    </>
  );
}
