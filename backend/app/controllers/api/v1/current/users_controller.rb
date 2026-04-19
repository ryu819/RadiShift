# frozen_string_literal: true

module Api
  module V1
    module Current
      class UsersController < ApplicationController
        before_action :authenticate_user!

        def show
          render json: current_user.as_json.merge(
            avatar_image_url: avatar_image_url
          )
        end

        def update
          if current_user.update(current_user_params)
            if current_user.saved_change_to_unconfirmed_email?
              render json: { message: "確認メールを送信しました。メールをご確認ください。", confirmation: true }, status: :ok
            else
              render json: { message: "アカウント情報を更新しました。" }, status: :ok
            end
          else
            render json: { message: "アカウントの更新に失敗しました。", errors: current_user.errors.to_hash(true) }, status: :unprocessable_content
          end
        end

        def destroy
          current_user.destroy!
          render json: { message: "アカウントを削除しました。" }, status: :ok
        end

        def avatar_image
          return render json: { message: "画像が送信されていません。" }, status: :bad_request if params[:avatar_image].blank?

          current_user.avatar_image.purge if current_user.avatar_image.attached?

          current_user.avatar_image.attach(params[:avatar_image])
          if current_user.save
            render json: { message: "ユーザーアイコンを更新しました。" }, status: :ok
          else
            render json: { errors: current_user.errors[:avatar_image] }, status: :unprocessable_content
          end
        end

        private

        def current_user_params
          params.require(:user).permit(:email, :name)
        end

        def avatar_image_url
          return unless current_user.avatar_image.attached?

          rails_blob_url(current_user.avatar_image, host: ENV.fetch("APP_HOST"))
        end
      end
    end
  end
end
