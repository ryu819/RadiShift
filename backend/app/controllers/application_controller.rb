# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::MimeResponds # APIモード
  before_action :configure_permitted_parameters, if: :devise_controller?

  private

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :email, :password, :password_confirmation])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
  end

  def require_facility!
    render json: { message: "施設に所属していません。" }, status: :not_found if current_user.facility.nil?
  end

  def require_no_facility!
    render json: { message: "すでに施設に所属しています。" }, status: :conflict if current_user.facility.present?
  end

  def require_admin!
    render json: { message: "管理者権限がありません。" }, status: :forbidden unless current_user.is_admin?
  end

  def reject_deleted_user!
    return unless current_user.is_deleted?

    render json: { message: "削除済みのアカウントです。" }, status: :unauthorized
  end
end
