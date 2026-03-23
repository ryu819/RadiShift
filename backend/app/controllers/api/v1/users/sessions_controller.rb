# frozen_string_literal: true

module Api
  module V1
    module Users
      class SessionsController < Devise::SessionsController
        include DeviseHackFakeSession
        wrap_parameters false
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: { message: "ログインしました。" }, status: :ok
        end

        def respond_to_on_destroy(_resource = nil)
          current_user ? log_out_success : log_out_failure
        end

        def log_out_success
          render json: { message: "ログアウトしました。" }, status: :ok
        end

        def log_out_failure
          render json: { message: "ログアウトに失敗しました。" }, status: :unauthorized
        end
      end
    end
  end
end
