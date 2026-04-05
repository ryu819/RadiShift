# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Current::Users", type: :request do
  let!(:user) { create(:user) }
  let!(:token) { login_and_get_token(user) }

  describe "GET /api/v1/current/user" do
    subject { get(api_v1_current_user_path, headers: { "Authorization": token }) }

    context "JWTが正常に送られた時" do
      it "正常にレコードを取得できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["id"]).to eq(user.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "JWTが空のままリクエストが送信された時" do
      let(:token) { nil }

      it "unauthorized エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["error"]).to eq("ログインもしくはアカウント登録してください。")
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PUT /api/v1/current/user" do
    subject { put(api_v1_current_user_path, params: params, headers: { "Authorization": token }) }

    context "nameを変更する時" do
      let(:params) { { user: { name: "テスト変更" } } }
      it "正常にレコードを更新できる" do
        subject
        JSON.parse(response.body)
        expect(user.reload.name).to eq("テスト変更")
        expect(response).to have_http_status(:ok)
      end
    end

    context "emailを変更する時" do
      let(:params) { { user: { email: "new@example.com" } } }
      it "unconfirmed_emailに入る" do
        subject
        expect(response).to have_http_status(:ok)
        expect(user.reload.unconfirmed_email).to eq("new@example.com")
      end
    end

    context "登録済みのemailを送った時" do
      let(:params) { { user: { email: user.email } } }

      it "エラーになり、unconfirmed_emailは変わらない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.unconfirmed_email).to be_nil
      end
    end

    context "バリデーションエラーのとき" do
      let(:params) { { user: { name: "" } } }
      it "更新に失敗する" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:unprocessable_content)
        expect(res["errors"]).to be_present
      end
    end

    context "permitしていない項目を送る時" do
      let(:params) { { user: { is_admin: true } } }
      it "is_admin は更新されない" do
        subject
        expect(response).to have_http_status(:ok)
        expect(user.reload.is_admin).to be(false)
      end
    end
  end

  describe "DELETE /api/v1/current/user" do
    subject { delete(api_v1_current_user_path, headers: { "Authorization": token }) }

    context "自分のアカウントを削除する時" do
      it "正常にレコードを削除できる" do
        expect { subject }
          .to change { User.count }.by(-1)

        expect(response).to have_http_status(:ok)
      end
    end
  end
end
