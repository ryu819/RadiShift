# frozen_string_literal: true

require "googleauth/id_tokens"

class GoogleIdentityVerifier
  class VerificationError < StandardError; end
  class ServiceUnavailableError < StandardError; end

  def self.call(credential)
    raise VerificationError, "Google認証に失敗しました。" if credential.blank?

    payload = Google::Auth::IDTokens.verify_oidc(
      credential,
      aud: ENV.fetch("GOOGLE_CLIENT_ID")
    )

    if payload["sub"].blank? ||
       payload["email"].blank? ||
       payload["email_verified"] != true
      raise VerificationError, "Google認証に失敗しました。"
    end

    {
      sub: payload["sub"],
      email: payload["email"],
      picture: payload["picture"]
    }
  rescue Google::Auth::IDTokens::VerificationError
    raise VerificationError, "Google認証に失敗しました。"
  rescue Google::Auth::IDTokens::KeySourceError
    raise ServiceUnavailableError, "Google認証サービスを確認できませんでした。"
  end
end
