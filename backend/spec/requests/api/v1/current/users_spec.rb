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

    context "削除済みユーザーの時" do
      before { user.update!(is_deleted: true) }

      it "unauthorized エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("削除済みのアカウントです。")
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "ユーザーアイコンが登録されている時" do
      let(:user) { create(:user, :with_avatar) }

      it "表示用variantのURLを返す" do
        subject

        res = JSON.parse(response.body)

        expect(res["avatar_image_url"]).to include(
          "/rails/active_storage/representations/redirect/"
        )
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe "PUT /api/v1/current/user" do
    subject { put(api_v1_current_user_path, params: params, headers: { "Authorization": token }) }

    context "nameを変更する時" do
      let(:params) { { user: { name: "テスト変更" } } }
      it "正常にレコードを更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(user.reload.name).to eq("テスト変更")
        expect(res["message"]).to eq("アカウントを更新しました。")
        expect(response).to have_http_status(:ok)
      end
    end

    context "emailを変更する時" do
      let(:params) { { user: { email: "new@example.com" } } }
      it "unconfirmed_emailに入る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("確認メールを送信しました。メールをご確認ください。")
        expect(response).to have_http_status(:ok)
        expect(user.reload.unconfirmed_email).to eq("new@example.com")
      end
    end

    context "登録済みのemailを送った時" do
      let(:params) { { user: { email: user.email } } }

      it "unconfirmed_emailは変わらない" do
        subject
        expect(response).to have_http_status(:ok)
        expect(user.reload.unconfirmed_email).to be_nil
      end
    end

    context "バリデーションエラーのとき" do
      let(:params) { { user: { name: "" } } }
      it "更新に失敗する" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("アカウントの更新に失敗しました。")
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
      it "ユーザーを物理削除せず、削除済み状態に更新できる" do
        original_name = user.name
        original_encrypted_password = user.encrypted_password

        expect { subject }.not_to change { User.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("アカウントを削除しました。")
        expect(user.reload.name).to eq(original_name)
        expect(user.reload.email).to eq("deleted_user_#{user.id}@example.invalid")
        expect(user.reload.encrypted_password).not_to eq(original_encrypted_password)
        expect(user.reload.is_deleted).to be true
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "削除できない" do
        expect { subject }.not_to change { User.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者は削除できません。（管理者権限の移譲が必要です。）")
        expect(user.reload.is_deleted).to be false
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "PATCH /api/v1/current/user/avatar_image" do
    subject { patch(avatar_image_api_v1_current_user_path, params: params, headers: { "Authorization": token }) }

    let(:file) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.png"), "image/png") }

    context "画像をアップロードする時" do
      let(:params) { { avatar_image: file } }

      it "画像がアップロードされる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("ユーザーアイコンを更新しました。")
        expect(response).to have_http_status(:ok)
        expect(user.reload.avatar_image).to be_attached
      end
    end

    context "既存画像がある時" do
      let(:params) { { avatar_image: file } }
      let!(:user) { create(:user, :with_avatar) }

      it "古い画像が削除され新しい画像が保存される" do
        expect { subject }
          .not_to change { ActiveStorage::Blob.count }
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(user.reload.avatar_image).to be_attached
        expect(res["message"]).to eq("ユーザーアイコンを更新しました。")
      end
    end

    context "画像が送られていない時" do
      let(:params) { { avatar_image: nil } }

      it "bad_requestが返る" do
        subject
        res = JSON.parse(response.body)

        expect(response).to have_http_status(:bad_request)
        expect(res["message"]).to eq("画像が送信されていません。")
      end
    end

    context "不正なファイル形式のとき" do
      let(:file) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.txt"), "text/plain") }
      let(:params) { { avatar_image: file } }

      it "バリデーションエラーになる" do
        subject
        res = JSON.parse(response.body)

        expect(response).to have_http_status(:unprocessable_content)
        expect(res["errors"]).to include(
          "対応している画像形式（JPEG・PNG）のファイルを選択してください。"
        )
      end
    end

    context "ファイルサイズが大きすぎるとき" do
      let(:file) do
        tempfile = Tempfile.new(["large", ".png"])
        tempfile.binmode
        tempfile.write("a" * 6.megabytes)
        tempfile.rewind

        Rack::Test::UploadedFile.new(tempfile.path, "image/png")
      end

      let(:params) { { avatar_image: file } }

      it "バリデーションエラーになる" do
        subject
        res = JSON.parse(response.body)

        expect(response).to have_http_status(:unprocessable_content)
        expect(res["errors"]).to include(
          "5MB以下の画像を選択してください。"
        )
      end
    end
  end
end
