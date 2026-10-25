# frozen_string_literal: true

require "rails_helper"

RSpec.describe PresignedUrlService do
  let(:blob) do
    ActiveStorage::Blob.new(key: "avatar-key", content_type: "image/png", byte_size: 762, checksum: "1B2M2Y8AsgTpgAmY7PhCfg==")
  end

  before do
    @original_region = ENV["AWS_REGION"]
    @original_bucket = ENV["S3_BUCKET"]
    ENV["AWS_REGION"] = "ap-northeast-1"
    ENV["S3_BUCKET"] = "avatar-test"

    allow(Aws::S3::Client).to receive(:new).and_return(Aws::S3::Client.new(stub_responses: true, region: "ap-northeast-1"))
  end

  after do
    ENV["AWS_REGION"] = @original_region
    ENV["S3_BUCKET"] = @original_bucket
  end

  describe "#generate_presigned_url" do
    it "10分有効で、形式・容量・MD5を署名したPUT用URLを返す" do
      result = PresignedUrlService.new.generate_presigned_url(blob)

      expect(result[:upload_url]).to include("avatar-test", "/avatar-key", "X-Amz-Expires=600")
      expect(result[:upload_url]).to include("content-length", "content-md5", "content-type")
      expect(result[:headers]).to eq("Content-Type" => "image/png", "Content-MD5" => "1B2M2Y8AsgTpgAmY7PhCfg==")
    end
  end
end
