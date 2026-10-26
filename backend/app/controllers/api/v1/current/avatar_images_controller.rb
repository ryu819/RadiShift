# frozen_string_literal: true

module Api
  module V1
    module Current
      class AvatarImagesController < ApplicationController
        MAX_BYTES = 5.megabytes
        CONTENT_TYPES = { "image/jpeg" => "avatar.jpg", "image/png" => "avatar.png" }.freeze

        skip_before_action :require_facility!

        def create
          return render_invalid_image unless valid_image_params?

          blob = ActiveStorage::Blob.create_before_direct_upload!(
            filename: CONTENT_TYPES[params[:content_type]],
            content_type: params[:content_type],
            byte_size: params[:byte_size].to_i,
            checksum: params[:checksum],
            service_name: "amazon"
          )

          result = PresignedUrlService.new.generate_presigned_url(blob)
          result[:signed_id] = blob.signed_id(purpose: upload_purpose, expires_in: 10.minutes)

          render json: result, status: :ok
        end

        def update
          blob = ActiveStorage::Blob.find_signed(params[:signed_id].to_s, purpose: upload_purpose)
          return render_invalid_image if blob.nil?
          return render_invalid_image unless blob.service.exist?(blob.key)

          if current_user.update(avatar_image: blob)
            render json: { message: "ユーザーアイコンを更新しました。" }, status: :ok
          else
            render json: {
              message: "ユーザーアイコンの更新に失敗しました。",
              errors: current_user.errors.to_hash(true)
            }, status: :unprocessable_content
          end
        end

        def destroy
          return render json: { message: "ユーザーアイコンが登録されていません。" }, status: :not_found unless current_user.avatar_image.attached?

          current_user.with_lock do
            current_user.avatar_image.purge
          end

          render json: { message: "ユーザーアイコンを削除しました。" }, status: :ok
        end

        private

        def upload_purpose
          "avatar_image_upload:#{current_user.id}"
        end

        def valid_image_params?
          return false unless CONTENT_TYPES.key?(params[:content_type])
          return false if params[:checksum].blank?

          params[:byte_size].to_i.between?(1, MAX_BYTES - 1)
        end

        def render_invalid_image
          render json: {
            message: "5MiB未満のJPEG・PNG画像を選び直してください。"
          }, status: :unprocessable_content
        end
      end
    end
  end
end
