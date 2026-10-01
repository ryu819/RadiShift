import { GoogleLinkDialogButton } from "@/components/account-settings/GoogleLinkDialogButton";
import { GoogleUnlinkDialogButton } from "@/components/account-settings/GoogleUnlinkDialogButton";

type Props = {
  googleEmail: string | null;
  passwordSet: boolean;
};

export function GoogleAccountSettings({ googleEmail, passwordSet }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="font-medium">Googleアカウント</p>

        {googleEmail ? (
          <p className="mt-1 text-sm text-muted-foreground">
            連携済み：{googleEmail}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            Googleアカウントは連携されていません。
          </p>
        )}
      </div>

      {!passwordSet && (
        <p className="text-sm text-muted-foreground">
          Googleアカウントの連携を変更するには、
          先にパスワードを設定してください。
        </p>
      )}

      {googleEmail ? (
        <GoogleUnlinkDialogButton disabled={!passwordSet} />
      ) : (
        <GoogleLinkDialogButton disabled={!passwordSet} />
      )}
    </div>
  );
}
