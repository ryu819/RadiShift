# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::MimeResponds # APIモード
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :email, :password, :password_confirmation])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :email, :rules_text, :password, :password_confirmation])
  end
end
