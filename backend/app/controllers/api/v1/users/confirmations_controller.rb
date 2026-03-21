# frozen_string_literal: true

module Api
  module V1
    module Users
      class ConfirmationsController < Devise::ConfirmationsController
        include DeviseHackFakeSession
        wrap_parameters false
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          return confirm_success if resource.errors.empty?

          confirm_failed
        end

        def confirm_success
          render json: {
            message: "メール認証が完了しました。"
          }, status: :ok
        end

        def confirm_failed
          render json: {
            message: "メール認証に失敗しました。"
          }, status: :unprocessable_entity
        end
      end
    end
  end
end
