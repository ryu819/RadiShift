# frozen_string_literal: true

module Api
  module V1
    module Users
      class PasswordsController < Devise::PasswordsController
        include DeviseHackFakeSession
        wrap_parameters false
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          return send_email if action_name == "create"

          return reset_password_success if (action_name == "update") && resource.errors.empty?

          reset_password_failed
        end

        def send_email
          render json: {
            message: "パスワードリセット用のメールを送信しました。メールをご確認ください。"
          }, status: :ok
        end

        def reset_password_success
          render json: {
            message: "パスワードを変更しました。"
          }, status: :ok
        end

        def reset_password_failed
          render json: {
            message: "パスワード変更に失敗しました。",
            errors: resource.errors.to_hash(true)
          }, status: :unprocessable_entity
        end
      end
    end
  end
end
