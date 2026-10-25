# frozen_string_literal: true

require "aws-sdk-s3"

class PresignedUrlService
  def initialize
    @client = Aws::S3::Client.new(region: ENV.fetch("AWS_REGION"))
    @signer = Aws::S3::Presigner.new(client: @client)
    @bucket = ENV.fetch("S3_BUCKET")
  end

  def generate_presigned_url(blob)
    upload_url = @signer.presigned_url(
      :put_object,
      bucket: @bucket,
      key: blob.key,
      content_type: blob.content_type,
      content_length: blob.byte_size,
      content_md5: blob.checksum,
      whitelist_headers: ["content-length"],
      expires_in: 600 # 10分
    )

    {
      upload_url:,
      headers: { "Content-Type" => blob.content_type, "Content-MD5" => blob.checksum }
    }
  end
end
