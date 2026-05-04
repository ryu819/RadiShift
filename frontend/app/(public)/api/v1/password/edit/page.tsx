import { PasswordResetForm } from "@/components/PasswordResetForm";

type Props = {
  searchParams: Promise<{
    reset_password_token?: string;
  }>;
};

import { Suspense } from "react";

async function PasswordResetContent({ searchParams }: Props) {
  const { reset_password_token: resetPasswordToken } = await searchParams;

  return <PasswordResetForm resetPasswordToken={resetPasswordToken} />;
}

export default async function PasswordResetPage({ searchParams }: Props) {
  return (
    <div className="min-w-xs sm:min-w-sm px-4 text-secondary space-y-6">
      <h1 className="text-2xl font-bold text-center">パスワード再設定</h1>

      <Suspense fallback={null}>
        <PasswordResetContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
