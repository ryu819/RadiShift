# frozen_string_literal: true

module Api
  module V1
    class GoogleRegistrationsController < ApplicationController
      include DeviseHackFakeSession

      skip_before_action :authenticate_user!
      skip_before_action :reject_deleted_user!
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

      def check
        google_identity = GoogleIdentityVerifier.call(params[:credential])

        if User.exists?(google_sub: google_identity[:sub])
          return render json: {
            status: "already_registered",
            message: "このGoogleアカウントは登録済みです。ログインしてください。"
          }, status: :ok
        end

        status = if User.exists?(email: google_identity[:email])
                   "existing_user"
                 else
                   "new_user"
                 end

        render json: {
          status: status,
          email: google_identity[:email],
          name: google_identity[:name]
        }, status: :ok
      end

      def create
        google_identity = GoogleIdentityVerifier.call(params[:credential])

        return render_google_account_already_registered if User.exists?(google_sub: google_identity[:sub])

        if User.exists?(email: google_identity[:email])
          return render json: {
            message: "このメールアドレスのRadiShiftアカウントが存在します。現在のパスワードを入力してください。"
          }, status: :conflict
        end

        user = User.new(
          name: params[:name],
          email: google_identity[:email],
          google_sub: google_identity[:sub],
          google_email: google_identity[:email]
        )

        user.skip_confirmation!

        if user.save
          sign_in(:user, user, store: false)

          render json: {
            message: "アカウントを登録しました。"
          }, status: :created
        else
          render json: {
            message: "新規登録に失敗しました。",
            errors: user.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def link
        google_identity = GoogleIdentityVerifier.call(params[:credential])

        return render_google_account_already_registered if User.exists?(google_sub: google_identity[:sub])

        user = User.find_by(email: google_identity[:email])

        if user.nil?
          return render json: {
            message: "既存のRadiShiftアカウントが見つかりません。もう一度Googleで登録してください。"
          }, status: :conflict
        end

        if user.is_deleted?
          return render json: {
            message: "削除済みのアカウントです。"
          }, status: :unauthorized
        end

        linked = user.with_lock do
          link_google_account(user, google_identity)
        end

        return unless linked

        sign_in(:user, user, store: false)

        render json: {
          message: "Googleアカウントを連携しました。"
        }, status: :ok
      end

      private

      def render_google_account_already_registered
        render json: {
          message: "このGoogleアカウントは登録済みです。ログインしてください。"
        }, status: :conflict
      end

      def render_link_failed(user)
        render json: {
          message: "Googleアカウントの連携に失敗しました。"
        }, status: :unprocessable_content
      end

      def link_google_account(user, google_identity)
        password = params[:current_password]

        unless password.present? && user.valid_password?(password)
          render json: {
            message: "パスワードが正しくありません。"

          }, status: :unprocessable_content

          return false
        end

        if user.google_sub.present?
          render json: {
            message: "このRadiShiftアカウントにはすでにGoogleアカウントが連携されています。"
          }, status: :conflict

          return false
        end

        if User.exists?(google_sub: google_identity[:sub])
          render_google_account_already_registered
          return false
        end

        user.google_sub = google_identity[:sub]
        user.google_email = google_identity[:email]

        unless save_google_link(user)
          render_link_failed(user)
          return false
        end

        true
      end

      def save_google_link(user)
        return user.save if user.confirmed?

        user.confirm(ensure_valid: true)
      end
    end
  end
end
