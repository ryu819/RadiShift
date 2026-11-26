# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Current::AvatarImages", type: :request do
  let!(:user) { create(:user, :with_avatar) }
  let!(:token) { login_and_get_token(user) }
  let!(:old_blob) { user.avatar_image.blob }
  let(:bytes) { Rails.root.join("spec/fixtures/files/avatar-256.png").binread }
  let(:params) { { content_type: "image/png", byte_size: bytes.bytesize, checksum: Digest::MD5.base64digest(bytes) } }

  describe "POST /api/v1/current/user/avatar_image" do
    subject do
      post(api_v1_current_user_avatar_image_path, params: params, headers: { "Authorization": token })
    end

    context "正しい画像情報の時" do
      it "既定の保存先へのアップロード用URLと本人用のsigned_idを返し、アイコンはまだ変えない" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["upload_url"]).to start_with("http://#{ENV.fetch('APP_HOST')}/rails/active_storage/disk/")
        expect(res["headers"]).to eq("Content-Type" => "image/png")
        blob = ActiveStorage::Blob.find_signed(res["signed_id"], purpose: "avatar_image_upload:#{user.id}")
        expect(blob.service_name).to eq(ActiveStorage::Blob.service.name.to_s)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "保存先が本番と同じS3の時" do
      let(:s3_service) do
        ActiveStorage::Service.configure(
          :amazon,
          { amazon: { service: "S3", region: "ap-northeast-1", bucket: "avatar-test", stub_responses: true } }
        )
      end

      before do
        allow(ActiveStorage::Blob).to receive(:service).and_return(s3_service)
        allow(ActiveStorage::Blob.services).to receive(:fetch).and_call_original
        allow(ActiveStorage::Blob.services).to receive(:fetch).with("amazon").and_return(s3_service)
      end

      it "形式・容量・MD5を署名した10分有効のS3署名付きURLと、CORSで許した2つのヘッダーだけを返す" do
        subject
        res = JSON.parse(response.body)
        upload_url = URI(res["upload_url"])
        query = URI.decode_www_form(upload_url.query).to_h
        expect(response).to have_http_status(:ok)
        expect(upload_url.host).to eq("avatar-test.s3.ap-northeast-1.amazonaws.com")
        expect(query["X-Amz-Expires"]).to eq("600")
        expect(query["X-Amz-SignedHeaders"]).to eq("content-length;content-md5;content-type;host")
        expect(res["headers"]).to eq("Content-Type" => "image/png", "Content-MD5" => params[:checksum])
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
        checksum: Digest::MD5.base64digest(bytes)
      )
    end
    let(:signed_id) { blob.signed_id(purpose: "avatar_image_upload:#{user.id}") }

    def upload_file
      blob.service.upload(blob.key, StringIO.new(bytes))
    end

    context "保存先へ送信済みの時" do
      before { upload_file }

      it "アイコンを更新する" do
        subject
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["message"]).to eq("ユーザーアイコンを更新しました。")
        expect(user.reload.avatar_image.blob).to eq(blob)
      end
    end

    context "保存先に画像が無い時" do
      it "アイコンを変えない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "中身がGIFなのにPNGと申告した画像の時" do
      let(:bytes) { Base64.decode64("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7") }

      before { upload_file }

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

      before { upload_file }

      it "アイコンを変えない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "期限切れのsigned_idの時" do
      let(:signed_id) { blob.signed_id(purpose: "avatar_image_upload:#{user.id}", expires_at: 1.minute.ago) }

      before { upload_file }

      it "アイコンを変えない" do
        subject
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "未ログインの時" do
      before { upload_file }

      it "送信済みの本人用signed_idでも401を返し、アイコンを変えない" do
        patch(api_v1_current_user_avatar_image_path, params: { signed_id: signed_id })
        expect(response).to have_http_status(:unauthorized)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end
  end

  describe "発行したURLへのブラウザからの送信と登録（既定の保存先）" do
    def prepare_upload
      post(api_v1_current_user_avatar_image_path, params: params, headers: { "Authorization": token })
      JSON.parse(response.body)
    end

    def send_to(target, body)
      put(URI(target["upload_url"]).path, params: body, headers: target["headers"])
    end

    def register(target)
      patch(api_v1_current_user_avatar_image_path, params: { signed_id: target["signed_id"] }, headers: { "Authorization": token })
    end

    context "発行どおりの画像を送った時" do
      it "保存先に保存し、登録するとアイコンが新しい画像になる" do
        target = prepare_upload
        send_to(target, bytes)
        expect(response).to have_http_status(:no_content)

        register(target)
        expect(response).to have_http_status(:ok)
        new_blob = user.reload.avatar_image.blob
        expect(new_blob).not_to eq(old_blob)
        expect(new_blob.download).to eq(bytes)
      end
    end

    context "容量は同じで中身の違う画像を送った時" do
      it "送信も登録も422になり、アイコンを変えない" do
        target = prepare_upload
        tampered = bytes.dup.tap { |b| b.setbyte(-1, b.getbyte(-1) ^ 0xFF) }
        send_to(target, tampered)
        expect(response).to have_http_status(:unprocessable_content)

        register(target)
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.avatar_image.blob).to eq(old_blob)
      end
    end

    context "発行時と容量の違う画像を送った時" do
      it "送信も登録も422になり、アイコンを変えない" do
        target = prepare_upload
        send_to(target, "#{bytes}x")
        expect(response).to have_http_status(:unprocessable_content)

        register(target)
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
