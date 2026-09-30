# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::GoogleSessions", type: :request do
  describe "POST /api/v1/google_login" do
    subject { post(api_v1_google_login_path, params: { credential: credential }) }

    let(:credential) { "google-id-token" }

    context "Googleアカウントが連携済みの時" do
      let!(:user) { create(:user, google_sub: "123456789", google_email: "old@gmail.com") }

      before do
        allow(GoogleIdentityVerifier)
          .to receive(:call)
                .with(credential)
                .and_return(
                  {
                    sub: "123456789",
                    email: "new@gmail.com"
                  }
                )
      end

      it "ログインできる" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["message"]).to eq("ログインしました。")
      end

      it "JWTがAuthorizationヘッダーに発行される" do
        subject
        expect(response.headers["Authorization"]).to start_with("Bearer ")
      end

      it "Googleのメールアドレスが変わっていれば更新する" do
        subject
        expect(user.reload.google_email).to eq("new@gmail.com")
      end
    end

    context "Googleアカウントが登録されていない時" do
      before do
        allow(GoogleIdentityVerifier)
          .to receive(:call)
                .with(credential)
                .and_return(
                  {
                    sub: "unregistered-google-sub",
                    email: "unregistered@gmail.com"
                  }
                )
      end

      it "新規登録を案内する" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:unprocessable_content)
        expect(res["message"]).to eq("このGoogleアカウントは登録されていません。新規登録からGoogleで登録してください。")
        expect(res["code"]).to eq("google_account_not_registered")
      end

      it "JWTを発行しない" do
        subject
        expect(response.headers["Authorization"]).to be_nil
      end

      it "Userを自動作成しない" do
        expect { subject }.not_to change { User.count }
      end
    end

    context "削除済みユーザーの時" do
      let!(:user) { create(:user, google_sub: "123456789", google_email: "test@gmail.com", is_deleted: true) }

      before do
        allow(GoogleIdentityVerifier)
          .to receive(:call)
                .with(credential)
                .and_return(
                  {
                    sub: user.google_sub,
                    email: user.google_email
                  }
                )
      end

      it "ログインできない" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:unauthorized)
        expect(res["message"]).to eq("削除済みのアカウントです。")
      end
    end

    context "ログインできない状態のユーザーの時" do
      let!(:user) { create(:user, google_sub: "123456789", google_email: "test@gmail.com", confirmed_at: nil, confirmation_sent_at: Time.current) }

      before do
        allow(GoogleIdentityVerifier)
          .to receive(:call)
                .with(credential)
                .and_return(
                  {
                    sub: user.google_sub,
                    email: user.google_email
                  }
                )
      end

      it "ログインできない" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:unauthorized)
        expect(res["message"]).to eq("Google認証に失敗しました。")
      end
    end

    context "Google ID Tokenが不正な時" do
      before do
        allow(GoogleIdentityVerifier)
          .to receive(:call)
                .with(credential)
                .and_raise(
                  GoogleIdentityVerifier::VerificationError,
                  "Google認証に失敗しました。"
                )
      end

      it "unauthorizedを返す" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:unauthorized)
        expect(res["message"]).to eq("Google認証に失敗しました。")
      end
    end

    context "Google認証サービスを確認できない時" do
      before do
        allow(GoogleIdentityVerifier)
          .to receive(:call)
                .with(credential)
                .and_raise(
                  GoogleIdentityVerifier::ServiceUnavailableError,
                  "Google認証サービスを確認できませんでした。"
                )
      end

      it "service_unavailableを返す" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:service_unavailable)
        expect(res["message"]).to eq("Google認証サービスを確認できませんでした。")
      end
    end
  end
end
