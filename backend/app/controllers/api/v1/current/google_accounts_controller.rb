# frozen_string_literal: true

module Api
  module V1
    module Current
      class GoogleAccountsController < ApplicationController
        skip_before_action :require_facility!

        rescue_from GoogleIdentityVerifier::VerificationError do |error|
          render json: {
            message: error.message
          }, status: :unauthorized
        end

        rescue_from GoogleIdentityVerifier::ServiceUnavailableError do |error|
          render json: {
            message: error.message
          }, status: :service_unavailable
        end

        def create
          return render_already_linked if current_user.google_sub.present?
          return render_invalid_password unless valid_current_password?

          google_identity = GoogleIdentityVerifier.call(params[:credential])

          current_user.with_lock do
            return render_google_account_in_use if User.exists?(google_sub: google_identity[:sub])

            current_user.update!(
              google_sub: google_identity[:sub],
              google_email: google_identity[:email]
            )
          end

          render json: {
            message: "Googleアカウントを連携しました。"
          }, status: :ok
        end

        def destroy
          return render_not_linked if current_user.google_sub.blank?
          return render_password_not_set unless current_user.password_set?
          return render_invalid_password unless valid_current_password?

          current_user.with_lock do
            current_user.update!(
              google_sub: nil,
              google_email: nil
            )
          end

          render json: {
            message: "Googleアカウントの連携を解除しました。"
          }, status: :ok
        end

        private

        def valid_current_password?
          password = params[:current_password]

          password.present? && current_user.valid_password?(password)
        end

        def render_already_linked
          render json: {
            message: "Googleアカウントはすでに連携されています。",
            code: "google_account_already_linked"
          }, status: :conflict
        end

        def render_not_linked
          render json: {
            message: "Googleアカウントは連携されていません。",
            code: "google_account_not_linked"
          }, status: :conflict
        end

        def render_password_not_set
          render json: {
            message: "先にRadiShiftのパスワードを設定してください。",
            code: "password_not_set"
          }, status: :unprocessable_content
        end

        def render_invalid_password
          render json: {
            message: "パスワードが正しくありません。",
            errors: {
              current_password: ["が正しくありません。"]
            }
          }, status: :unprocessable_content
        end

        def render_google_account_in_use
          render json: {
            message: "このGoogleアカウントは別のRadiShiftアカウントに連携されています。",
            code: "google_account_in_use"
          }, status: :conflict
        end
      end
    end
  end
end
