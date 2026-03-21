# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::MimeResponds # APIモード
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :password_confirmation])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
    devise_parameter_sanitizer.permit(:account_update, keys: [:email, :password, :password_confirmation])
    devise_parameter_sanitizer.permit(:reset_password, keys: [:password, :password_confirmation, :reset_password_token])
    devise_parameter_sanitizer.permit(:confirmation, keys: [:confirmation_token])
  end
end
