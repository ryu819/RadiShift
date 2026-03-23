# frozen_string_literal: true

Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?

  devise_for :users,
             defaults: { format: :json },
             path: "api/v1",
             path_names: {
               sign_in: "login",
               sign_out: "logout",
               registration: "signup",
               password: "reset_password",
               confirmation: "email_confirmation"
             },
             controllers: {
               sessions: "api/v1/users/sessions",
               registrations: "api/v1/users/registrations",
               passwords: "api/v1/users/passwords",
               confirmations: "api/v1/users/confirmations"
             }

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      namespace :current do
        resource :user, only: [:show, :update, :destroy] do
        end
      end
      get "health_check", to: "health_check#index"
    end
  end
end
