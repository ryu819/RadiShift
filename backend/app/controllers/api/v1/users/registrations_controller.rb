# frozen_string_literal: true

module Api
  module V1
    module Users
      class RegistrationsController < Devise::RegistrationsController
        include DeviseHackFakeSession
        wrap_parameters false
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          return register_success if resource.persisted?

          register_failed
        end

        def register_success
          render json: { message: "認証メールを送信しました。メールをご確認ください。" }, status: :ok
        end

        def register_failed
          render json: {
            message: "新規登録に失敗しました。",
            errors: resource.errors.to_hash(true)
          }, status: :unprocessable_entity
        end
      end
    end
  end
end
