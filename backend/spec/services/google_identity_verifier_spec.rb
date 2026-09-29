# frozen_string_literal: true

require "rails_helper"

RSpec.describe GoogleIdentityVerifier do
  let(:credential) { "google-id-token" }

  let(:payload) do
    {
      "sub" => "123456789",
      "email" => "test@gmail.com",
      "email_verified" => true,
      "picture" => "https://example.com/avatar.png"
    }
  end

  before do
    @original_client_id = ENV["GOOGLE_CLIENT_ID"]
    ENV["GOOGLE_CLIENT_ID"] = "test-client-id.apps.googleusercontent.com"

    allow(Google::Auth::IDTokens)
      .to receive(:verify_oidc)
            .and_return(payload)
  end

  after do
    ENV["GOOGLE_CLIENT_ID"] = @original_client_id
  end

  context "正常なGoogle ID Tokenの時" do
    it "Googleアカウント情報を返す" do
      result = GoogleIdentityVerifier.call(credential)

      expect(result[:sub]).to eq("123456789")
      expect(result[:email]).to eq("test@gmail.com")
      expect(result[:picture]).to eq("https://example.com/avatar.png")
    end

    it "Google Client IDを使ってTokenを検証する" do
      GoogleIdentityVerifier.call(credential)

      expect(Google::Auth::IDTokens)
        .to have_received(:verify_oidc)
              .with(
                credential,
                aud: "test-client-id.apps.googleusercontent.com"
              )
    end
  end

  context "プロフィール画像がない時" do
    let(:payload) do
      {
        "sub" => "123456789",
        "email" => "test@gmail.com",
        "email_verified" => true
      }
    end

    it "pictureはnilになる" do
      result = GoogleIdentityVerifier.call(credential)

      expect(result[:picture]).to be_nil
    end
  end

  context "credentialが空の時" do
    it "認証失敗になる" do
      expect do
        GoogleIdentityVerifier.call(nil)
      end.to raise_error(
        GoogleIdentityVerifier::VerificationError,
        "Google認証に失敗しました。"
      )
    end
  end

  context "subがない時" do
    let(:payload) do
      {
        "email" => "test@gmail.com",
        "email_verified" => true
      }
    end

    it "認証失敗になる" do
      expect do
        GoogleIdentityVerifier.call(credential)
      end.to raise_error(GoogleIdentityVerifier::VerificationError)
    end
  end

  context "emailがない時" do
    let(:payload) do
      {
        "sub" => "123456789",
        "email_verified" => true
      }
    end

    it "認証失敗になる" do
      expect do
        GoogleIdentityVerifier.call(credential)
      end.to raise_error(GoogleIdentityVerifier::VerificationError)
    end
  end

  context "Google側でemailが確認済みでない時" do
    let(:payload) do
      {
        "sub" => "123456789",
        "email" => "test@example.com",
        "email_verified" => false
      }
    end

    it "認証失敗になる" do
      expect do
        GoogleIdentityVerifier.call(credential)
      end.to raise_error(GoogleIdentityVerifier::VerificationError)
    end
  end

  context "Google ID Tokenの検証に失敗した時" do
    before do
      allow(Google::Auth::IDTokens)
        .to receive(:verify_oidc)
              .and_raise(Google::Auth::IDTokens::VerificationError)
    end

    it "認証失敗として扱う" do
      expect do
        GoogleIdentityVerifier.call(credential)
      end.to raise_error(
        GoogleIdentityVerifier::VerificationError,
        "Google認証に失敗しました。"
      )
    end
  end

  context "Google公開鍵を取得できない時" do
    before do
      allow(Google::Auth::IDTokens)
        .to receive(:verify_oidc)
              .and_raise(Google::Auth::IDTokens::KeySourceError)
    end

    it "Google認証サービスのエラーとして扱う" do
      expect do
        GoogleIdentityVerifier.call(credential)
      end.to raise_error(
        GoogleIdentityVerifier::ServiceUnavailableError,
        "Google認証サービスを確認できませんでした。"
      )
    end
  end

  context "GOOGLE_CLIENT_IDが設定されていない時" do
    before do
      ENV.delete("GOOGLE_CLIENT_ID")
    end

    it "設定エラーになる" do
      expect do
        GoogleIdentityVerifier.call(credential)
      end.to raise_error(KeyError)
    end
  end
end
