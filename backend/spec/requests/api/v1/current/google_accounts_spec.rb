# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Current::GoogleAccounts", type: :request do
  let!(:user) { create(:user, email: "radi@example.com", password: "password") }

  let!(:token) { login_and_get_token(user) }

  let(:credential) { "google-id-token" }
  let(:current_password) { "password" }

  let(:google_identity) { { sub: "123456789", email: "google@gmail.com" } }

  before do
    allow(GoogleIdentityVerifier)
      .to receive(:call)
            .with(credential)
            .and_return(google_identity)
  end

  describe "POST /api/v1/current/google_account" do
    subject do
      post(api_v1_current_google_account_path, params: { credential: credential, current_password: current_password }, headers: { "Authorization": token })
    end

    context "パスワードとGoogle認証が正しい時" do
      it "Googleアカウントを連携する" do
        subject
        user.reload
        expect(response).to have_http_status(:ok)
        expect(user.google_sub).to eq("123456789")
        expect(user.google_email).to eq("google@gmail.com")
      end

      it "GoogleとRadiShiftのメールが違っていても連携できる" do
        subject
        expect(user.reload.email).to eq("radi@example.com")
        expect(user.google_email).to eq("google@gmail.com")
      end
    end

    context "現在のパスワードが間違っている時" do
      let(:current_password) { "wrong-password" }

      it "連携しない" do
        subject
        user.reload
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.google_sub).to be_nil
        expect(user.google_email).to be_nil
      end
    end

    context "すでにGoogleアカウントが連携されている時" do
      before do
        user.update!(
          google_sub: "already-linked",
          google_email: "already@gmail.com"
        )
      end

      it "上書きしない" do
        subject
        res = JSON.parse(response.body)
        user.reload
        expect(response).to have_http_status(:conflict)
        expect(res["code"]).to eq("google_account_already_linked")
        expect(user.google_sub).to eq("already-linked")
      end
    end

    context "Googleアカウントが別Userに使われている時" do
      let!(:other_user) { create(:user, google_sub: "123456789", google_email: "google@gmail.com") }

      it "連携しない" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:conflict)
        expect(res["code"]).to eq("google_account_in_use")
        expect(user.reload.google_sub).to be_nil
      end
    end
  end

  describe "DELETE /api/v1/current/google_account" do
    subject do
      delete(api_v1_current_google_account_path, params: { current_password: current_password }, headers: { "Authorization": token })
    end

    before do
      user.update!(
        google_sub: "123456789",
        google_email: "google@gmail.com"
      )
    end

    context "現在のパスワードが正しい時" do
      it "Google連携を解除する" do
        subject
        user.reload
        expect(response).to have_http_status(:ok)
        expect(user.google_sub).to be_nil
        expect(user.google_email).to be_nil
      end
    end

    context "現在のパスワードが間違っている時" do
      let(:current_password) { "wrong-password" }

      it "Google連携を解除しない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.google_sub).to eq("123456789")
      end
    end

    context "RadiShiftのパスワードが未設定の時" do
      before do
        user.update!(encrypted_password: "")
      end

      it "先にパスワード設定を要求する" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:unprocessable_content)
        expect(res["code"]).to eq("password_not_set")
        expect(user.reload.google_sub).to eq("123456789")
      end
    end
  end
end
