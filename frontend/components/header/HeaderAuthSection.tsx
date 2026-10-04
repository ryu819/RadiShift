import { LoginForm } from "@/components/header/login/LoginForm";
import { SignUpForm } from "@/components/header/signup/SignupForm";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";

import { UserDropdownMenu } from "./UserDropdownMenu";

export async function HeaderAuthSection() {
  const user = await getCurrentUser();

  return user ? (
    <>
      {user.isDemo && (
        <div className="text-red-400">
          <span className="sm:hidden">デモ環境</span>
          <span className="hidden sm:inline">デモ環境（24時間後に削除）</span>
        </div>
      )}

      <UserDropdownMenu user={user} />
    </>
  ) : (
    <>
      <SignUpForm />
      <LoginForm />
    </>
  );
}
