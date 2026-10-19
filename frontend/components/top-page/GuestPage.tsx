import Image from "next/image";

import { LoginForm } from "@/components/header/login/LoginForm";
import { SignUpForm } from "@/components/header/signup/SignupForm";
import { DemoStartButton } from "@/components/top-page/DemoStartButton";
import adminDashboard from "@/public/images/guest-page/admin-dashboard.png";
import masterShiftsMockup from "@/public/images/guest-page/master-shifts-mockup.png";
import myShiftsMobileMockup from "@/public/images/guest-page/my-shifts-mobile-mockup.png";
import shiftEdit from "@/public/images/guest-page/shift-edit.png";
import shiftRequest from "@/public/images/guest-page/shift-request.png";

const features = [
  {
    title: "施設全体のシフトを管理",
    description:
      "施設メンバーの勤務・休み・モダリティを一覧で確認し、管理者は日ごとの割当を編集できます。",
    image: shiftEdit,
    imageAlt: "全体シフトから勤務・休み・モダリティを編集している画面",
    imageSizes: "271px",
  },
  {
    title: "自分のシフト確認と希望申請",
    description:
      "自分のシフトを月ごとに確認し、勤務・休みの希望申請や申請履歴を確認できます。",
    image: shiftRequest,
    imageAlt: "勤務や休みの希望申請を行う画面",
    imageSizes: "247px",
  },
  {
    title: "施設・シフト設定をまとめて管理",
    description:
      "シフト、申請、施設情報、勤務・休み・モダリティなどの設定を管理できます。",
    image: adminDashboard,
    imageAlt: "施設やシフトの設定を管理している画面",
    imageSizes: "308px",
  },
];

const steps = [
  {
    title: "アカウント登録",
    description: "RadiShiftのアカウントを作成します。",
  },
  {
    title: "施設に参加",
    description: "施設を作成するか、招待コードを使って既存施設に参加します。",
  },
  {
    title: "シフト管理を開始",
    description: "施設の設定後、シフトの確認・作成・希望申請を始められます。",
  },
];

export function GuestPage() {
  return (
    <div className="w-full">
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-primary sm:text-base">
              放射線技師向けシフト管理サービス
            </p>

            <h1 className="mt-4 text-4xl font-bold text-secondary sm:text-5xl lg:text-6xl">
              シフト管理を
              <br />
              どこでも簡単に
            </h1>

            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              勤務・休み・モダリティの管理から希望申請まで。
              <br className="hidden sm:block" />
              シフト管理をWeb上でまとめて行えます。
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <SignUpForm triggerClassName="h-12 px-7 text-base" />
              <LoginForm triggerClassName="h-12 px-7 text-base" />
              <DemoStartButton className="h-12 px-7 text-base" />
            </div>
          </div>

          <div className="relative mx-auto max-w-3xl pb-10">
            <Image
              src={masterShiftsMockup}
              alt="RadiShiftの全体シフト画面"
              loading="eager"
              sizes="768px"
            />

            <div className="absolute -bottom-2 -left-2 sm:-left-6 w-32 sm:w-50">
              <Image
                src={myShiftsMobileMockup}
                alt="RadiShiftのマイシフト画面"
                sizes="200px"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">
              RadiShiftでできること
            </p>

            <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
              シフト管理に必要な機能をひとつに
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              施設全体の管理から、自分のシフト確認・希望申請まで、
              日々のシフト業務をまとめて管理できます。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-md border bg-white">
                <div className="flex h-56 items-center justify-center bg-slate-50 p-4">
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    sizes={feature.imageSizes}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-secondary">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">利用までの流れ</p>

            <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
              3ステップで利用を開始
            </h2>
          </div>

          <div className="relative grid gap-10 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-5 hidden border-t border-slate-300 md:block" />

            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="relative z-10 mx-auto flex size-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                  {index + 1}
                </div>

                <p className="mt-4 text-sm font-semibold text-primary">
                  STEP {index + 1}
                </p>

                <h3 className="mt-2 text-xl font-bold text-secondary">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-xs leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-secondary sm:text-4xl">
            RadiShiftでシフト管理を始める
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <SignUpForm triggerClassName="h-11 px-6 text-base" />
            <LoginForm triggerClassName="h-11 px-6 text-base" />
            <DemoStartButton className="h-11 px-6 text-base" />
          </div>
        </div>
      </section>
    </div>
  );
}
