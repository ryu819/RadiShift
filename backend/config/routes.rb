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
               password: "password",
               confirmation: "confirmation"
             },
             controllers: {
               sessions: "api/v1/users/sessions",
               registrations: "api/v1/users/registrations",
               passwords: "api/v1/users/passwords",
               confirmations: "api/v1/users/confirmations"
             }

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      post "demo_session", to: "demo_sessions#create"
      post "google_login", to: "google_sessions#create"
      post "google_signup/check", to: "google_registrations#check"
      post "google_signup", to: "google_registrations#create"
      post "google_signup/link", to: "google_registrations#link"

      namespace :current do
        resource :user, only: [:show, :update, :destroy] do
          resource :avatar_image, only: [:create, :update, :destroy]
        end
        resource :google_account, only: [:create, :destroy]
        resources :shifts, only: :show
      end
      namespace :admin do
        resources :pending_requests, only: :index
      end
      resource :facility, only: [:show, :create, :update, :destroy] do
        post :join
        delete :leave
        resource :invitation, only: [:show, :create, :destroy],
                              module: :facilities
      end
      resources :members, only: [:index, :update, :destroy] do
        collection do
          patch :reorder
        end

        member do
          patch :add_admin
          patch :remove_admin
        end
      end
      resources :schedule_months, only: [:index, :show, :create, :update, :destroy]
      resources :master_shifts, only: [:index, :show]
      resources :schedule_days, only: [:update]
      resources :work_types, only: [:index, :create, :update, :destroy]
      resources :day_off_types, only: [:index, :create, :update, :destroy]
      resources :modality_types, only: [:index, :create, :update, :destroy]
      resources :day_off_slot_rules, only: [:index, :create, :update]
      resources :day_off_slots, only: [:create, :update]
      resources :work_assignments, only: [:create, :update, :destroy] do
        member do
          patch :override
        end
      end
      resources :day_off_assignments, only: [:create, :update, :destroy] do
        member do
          patch :override
        end
      end
      resources :modality_assignments, only: [:create, :update, :destroy]
      resources :day_off_requests, only: [:index, :create, :update, :destroy]
      resources :work_requests, only: [:index, :create, :update, :destroy]
      get "health_check", to: "health_check#index"
    end
  end
end
