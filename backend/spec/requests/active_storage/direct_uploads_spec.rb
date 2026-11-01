# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Active Storage標準の直接アップロードAPI", type: :request do
  describe "POST /rails/active_storage/direct_uploads" do
    let(:params) do
      { blob: { filename: "test.txt", content_type: "text/plain", byte_size: 4, checksum: Digest::MD5.base64digest("test") } }
    end

    it "未ログインの要求を404で拒否し、画像情報もアップロード用URLも作らない" do
      expect do
        post rails_direct_uploads_path, params: params, as: :json
      end.not_to change { ActiveStorage::Blob.count }

      expect(response).to have_http_status(:not_found)
      expect(response.body).to be_empty
    end
  end
end
