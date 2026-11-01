# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Current::AvatarImages", type: :request do
  let!(:user) { create(:user, :with_avatar) }
  let!(:token) { login_and_get_token(user) }
  let!(:old_blob) { user.avatar_image.blob }
  let(:bytes) { Rails.root.join("spec/fixtures/files/avatar-256.png").binread }

  before do
    presigned_url_service = instance_double(PresignedUrlService, generate_presigned_url: { upload_url: "https://s3.example.test/upload" })
    allow(PresignedUrlService).to receive(:new).and_return(presigned_url_service)

    allow(ActiveStorage::Blob.services).to receive(:fetch).and_call_original
    allow(ActiveStorage::Blob.services).to receive(:fetch).with("amazon").and_return(ActiveStorage::Blob.service)
  end

  describe "POST /api/v1/current/user/avatar_image" do
    subject do
      post(api_v1_current_user_avatar_image_path, params: params, headers: { "Authorization": token })
    end

    let(:params) { { content_type: "image/png", byte_size: bytes.bytesize, checksum: Digest::MD5.base64digest(bytes) } }

    context "正しい画像情報の時" do
      it "アップロード用URLと本人用のsigned_idを返し、アイコンはまだ変えない" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["upload_url"]).to eq("https://s3.example.test/upload")
        expect(ActiveStorage::Blob.find_signed(res["signed_id"], purpose: "avatar_image_upload:#{user.id}")).to be_present
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "形式・容量・チェックサムが不正な時" do
      it "画像情報を作らない" do
        [{ content_type: "text/plain" }, { byte_size: 0 }, { byte_size: 5.megabytes }, { checksum: "" }].each do |invalid|
          expect do
            post(api_v1_current_user_avatar_image_path, params: params.merge(invalid), headers: { "Authorization": token })
          end.not_to change { ActiveStorage::Blob.count }
          expect(response).to have_http_status(:unprocessable_content)
        end
      end
    end

    context "未ログインの時" do
      it "401を返し、画像情報を作らない" do
        expect do
          post(api_v1_current_user_avatar_image_path, params: params)
        end.not_to change { ActiveStorage::Blob.count }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/current/user/avatar_image" do
    subject do
      patch(api_v1_current_user_avatar_image_path, params: { signed_id: signed_id }, headers: { "Authorization": token })
    end

    let(:blob) do
      ActiveStorage::Blob.create_before_direct_upload!(
        filename: "avatar.png", content_type: "image/png", byte_size: bytes.bytesize,
        checksum: Digest::MD5.base64digest(bytes), service_name: "amazon"
      )
    end
    let(:signed_id) { blob.signed_id(purpose: "avatar_image_upload:#{user.id}") }

    def upload_to_s3
      blob.service.upload(blob.key, StringIO.new(bytes))
    end

    context "S3へ送信済みの時" do
      before { upload_to_s3 }

      it "アイコンを更新する" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["message"]).to eq("ユーザーアイコンを更新しました。")
        expect(user.reload.avatar_image.blob).to eq(blob)
      end
    end

    context "S3に画像が無い時" do
      it "アイコンを変えない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "中身がGIFなのにPNGと申告した画像の時" do
      let(:bytes) { Base64.decode64("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7") }

      before { upload_to_s3 }

      it "アイコンを変えず、エラー内容を返す" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:unprocessable_content)
        expect(res["errors"]).to be_present
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "他人用のsigned_idの時" do
      let(:signed_id) { blob.signed_id(purpose: "avatar_image_upload:#{user.id + 1}") }

      before { upload_to_s3 }

      it "アイコンを変えない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "期限切れのsigned_idの時" do
      let(:signed_id) { blob.signed_id(purpose: "avatar_image_upload:#{user.id}", expires_at: 1.minute.ago) }

      before { upload_to_s3 }

      it "アイコンを変えない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end
  end

  describe "DELETE /api/v1/current/user/avatar_image" do
    subject do
      delete(api_v1_current_user_avatar_image_path, headers: { "Authorization": token })
    end

    def file_exists?(blob)
      blob.service.exist?(blob.key)
    end

    context "アイコン設定済みの時" do
      it "アイコンとファイルを削除し、成功を返す" do
        subject
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)["message"]).to eq("ユーザーアイコンを削除しました。")
        expect(user.reload.avatar_image).not_to be_attached
        expect(file_exists?(old_blob)).to be(false)
      end
    end

    context "他のユーザーもアイコンを設定している時" do
      let!(:other_user) { create(:user, :with_avatar) }

      it "他のユーザーのアイコンは削除しない" do
        subject
        expect(other_user.reload.avatar_image).to be_attached
        expect(file_exists?(other_user.avatar_image.blob)).to be(true)
      end
    end

    context "アイコン未設定の時" do
      let!(:user) { create(:user) }
      let!(:old_blob) { nil }

      it "404を返す" do
        subject
        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)["message"]).to eq("ユーザーアイコンが登録されていません。")
      end
    end

    context "S3の削除が最初から失敗した時" do
      before { allow(old_blob.service).to receive(:delete).and_raise(StandardError, "S3障害") }

      it "エラーになり、アイコンとファイルが残る" do
        expect { subject }.to raise_error(StandardError, "S3障害")
        expect(user.reload.avatar_image.blob).to eq(old_blob)
        expect(file_exists?(old_blob)).to be(true)
      end
    end

    context "ファイルを消した後に失敗した時（加工版の一括削除の失敗など）" do
      before { allow(old_blob.service).to receive(:delete_prefixed).and_raise(StandardError, "ListBucket拒否") }

      it "エラーになるが、もう一度削除すると完了する" do
        expect { subject }.to raise_error(StandardError, "ListBucket拒否")
        expect(user.reload.avatar_image).to be_attached

        allow(old_blob.service).to receive(:delete_prefixed).and_call_original
        delete(api_v1_current_user_avatar_image_path, headers: { "Authorization": token })
        expect(response).to have_http_status(:ok)
        expect(user.reload.avatar_image).not_to be_attached
      end
    end
  end
end
