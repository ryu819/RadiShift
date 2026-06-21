# frozen_string_literal: true

module Api
  module V1
    module Current
      class UsersController < ApplicationController
        before_action :authenticate_user!
        before_action :reject_deleted_user!

        def show
          render json: current_user.as_json(
            only: [:id, :name, :email, :facility_id, :is_admin]
          ).merge(
            avatar_image_url: avatar_image_url
          )
        end

        def update
          if current_user.update(current_user_params)
            if current_user.saved_change_to_unconfirmed_email?
              render json: { message: "確認メールを送信しました。メールをご確認ください。", confirmation: true }, status: :ok
            else
              render json: { message: "アカウントを更新しました。" }, status: :ok
            end
          else
            render json: { message: "アカウントの更新に失敗しました。", errors: current_user.errors.to_hash(true) }, status: :unprocessable_content
          end
        end

        def destroy
          return render json: { message: "管理者は削除できません。（管理者権限の移譲が必要です。）" }, status: :forbidden if current_user.is_admin?

          random_password = SecureRandom.urlsafe_base64(32)

          User.transaction do
            current_user.avatar_image.purge if current_user.avatar_image.attached?

            current_user.skip_reconfirmation!

            current_user.update!(
              facility_id: nil,
              email: "deleted_user_#{current_user.id}@example.invalid",
              password: random_password,
              password_confirmation: random_password,
              reset_password_token: nil,
              reset_password_sent_at: nil,
              confirmation_token: nil,
              confirmation_sent_at: nil,
              unconfirmed_email: nil,
              is_deleted: true
            )
          end

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
