# frozen_string_literal: true

module Api
  module V1
    class GoogleSessionsController < ApplicationController
      include DeviseHackFakeSession

      skip_before_action :authenticate_user!
      skip_before_action :reject_deleted_user!
      skip_before_action :require_facility!

      def create
        google_identity = GoogleIdentityVerifier.call(params[:credential])

        user = User.find_by(google_sub: google_identity[:sub])

        unless user
          return render json: {
            message: "このGoogleアカウントは登録されていません。新規登録からGoogleで登録してください。"
          }, status: :unprocessable_content
        end

        if user.is_deleted?
          return render json: {
            message: "削除済みのアカウントです。"
          }, status: :unauthorized
        end

        unless user.active_for_authentication?
          return render json: {
            message: "Google認証に失敗しました。"
          }, status: :unauthorized
        end

        update_google_email!(user, google_identity[:email])

        sign_in(:user, user, store: false)

        render json: {
          message: "ログインしました。"
        }, status: :ok
      rescue GoogleIdentityVerifier::VerificationError => e
        render json: {
          message: e.message
        }, status: :unauthorized
      rescue GoogleIdentityVerifier::ServiceUnavailableError => e
        render json: {
          message: e.message
        }, status: :service_unavailable
      end

      private

      def update_google_email!(user, google_email)
        return if user.google_email == google_email

        user.update!(google_email: google_email)
      end
    end
  end
end
