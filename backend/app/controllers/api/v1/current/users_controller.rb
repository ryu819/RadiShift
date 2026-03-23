# frozen_string_literal: true

module Api
  module V1
    module Current
      class UsersController < ApplicationController
        before_action :authenticate_user!

        def show
          render json: current_user
        end

        private

        def current_user_params
          params.require(:user).permit(:name)
        end
      end
    end
  end
end
