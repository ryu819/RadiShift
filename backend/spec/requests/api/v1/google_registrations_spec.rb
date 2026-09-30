# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::GoogleRegistrations", type: :request do
  let(:credential) { "google-id-token" }

  let(:google_identity) { { sub: "123456789", email: "google@gmail.com" } }

  before do
    allow(GoogleIdentityVerifier)
      .to receive(:call)
            .with(credential)
            .and_return(google_identity)
  end

  describe "POST /api/v1/google_signup/check" do
    subject { post(api_v1_google_signup_check_path, params: { credential: credential }) }

    context "未登録のGoogleアカウントかつ同じメールのUserがいない時" do
      it "new_userを返す" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["status"]).to eq("new_user")
        expect(res["email"]).to eq("google@gmail.com")
      end
    end

    context "同じメールのUserが存在する時" do
      let!(:user) { create(:user, email: "google@gmail.com") }

      it "existing_userを返す" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["status"]).to eq("existing_user")
      end
    end

    context "Googleアカウントがすでに連携されている時" do
      let!(:user) { create(:user, google_sub: "123456789", google_email: "google@gmail.com") }

      it "already_registeredを返す" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["status"]).to eq("already_registered")
      end
    end
  end

  describe "POST /api/v1/google_signup" do
    subject { post(api_v1_google_signup_path, params: { credential: credential, name: "Google太郎" }) }

    context "新しいGoogleユーザーの時" do
      it "Userを作成する" do
        expect { subject }.to change { User.count }.by(1)
        user = User.last
        expect(user.name).to eq("Google太郎")
        expect(user.email).to eq("google@gmail.com")
        expect(user.google_sub).to eq("123456789")
        expect(user.google_email).to eq("google@gmail.com")
      end

      it "パスワードなしで作成する" do
        subject
        expect(User.last.encrypted_password).to be_blank
      end

      it "確認済みUserとして作成する" do
        subject
        expect(User.last.confirmed?).to be true
      end

      it "JWTを発行する" do
        subject
        expect(response).to have_http_status(:created)
        expect(response.headers["Authorization"]).to start_with("Bearer ")
      end
    end

    context "Googleアカウントがすでに登録されている時" do
      let!(:user) { create(:user, google_sub: "123456789", google_email: "google@gmail.com") }

      it "Userを作成しない" do
        expect { subject }.not_to change { User.count }
        expect(response).to have_http_status(:conflict)
      end
    end

    context "同じメールの既存Userが存在する時" do
      let!(:user) { create(:user, email: "google@gmail.com") }

      it "Userを新しく作らない" do
        expect { subject }.not_to change { User.count }
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:conflict)
        expect(res["code"]).to eq("existing_user_requires_password")
      end
    end

    context "nameが空の時" do
      subject { post(api_v1_google_signup_path, params: { credential: credential, name: "" }) }

      it "登録できない" do
        expect { subject }.not_to change { User.count }

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  describe "POST /api/v1/google_signup/link" do
    subject { post(api_v1_google_signup_link_path, params: { credential: credential, current_password: current_password }) }

    let!(:user) { create(:user, email: "google@gmail.com", password: "password") }

    let(:current_password) { "password" }

    context "パスワードが正しい時" do
      it "既存UserにGoogleアカウントを連携する" do
        expect { subject }.not_to change { User.count }
        user.reload
        expect(user.google_sub).to eq("123456789")
        expect(user.google_email).to eq("google@gmail.com")
      end

      it "JWTを発行する" do
        subject
        expect(response).to have_http_status(:ok)
        expect(response.headers["Authorization"]).to start_with("Bearer ")
      end
    end

    context "パスワードが間違っている時" do
      let(:current_password) { "wrong-password" }

      it "Googleを連携しない" do
        subject
        user.reload
        expect(user.google_sub).to be_nil
        expect(user.google_email).to be_nil
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "未確認Userの時" do
      let!(:user) { create(:user, email: "google@gmail.com", password: "password", confirmed_at: nil, confirmation_sent_at: Time.current) }

      it "Google連携後に確認済みにする" do
        subject
        expect(user.reload.confirmed?).to be true
        expect(user.google_sub).to eq("123456789")
      end
    end

    context "Userに別のGoogleアカウントが連携済みの時" do
      before do
        user.update!(
          google_sub: "other-google-sub",
          google_email: "other@gmail.com"
        )
      end

      it "上書きしない" do
        subject
        res = JSON.parse(response.body)
        user.reload
        expect(response).to have_http_status(:conflict)
        expect(res["code"]).to eq("google_account_already_linked")
        expect(user.google_sub).to eq("other-google-sub")
      end
    end
  end
end
