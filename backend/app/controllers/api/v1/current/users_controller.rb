# frozen_string_literal: true

module Api
  module V1
    module Current
      class UsersController < ApplicationController
        before_action :authenticate_user!

        def show
          render json: current_user
        end

        def update
          if current_user.update(current_user_params)
            if current_user.unconfirmed_email.present?
              render json: { message: "確認メールを送信しました。メールをご確認ください。" }, status: :ok
            else
              render json: { message: "アカウント情報を更新しました。" }, status: :ok
            end
          else
            render json: { message: "アカウントの更新に失敗しました。", errors: current_user.errors.to_hash(true) }, status: :unprocessable_entity
          end
        end

        def destroy
          if current_user.destroy
            head :no_content
          else
            render json: { message: "アカウントの削除に失敗しました。" }, status: :unprocessable_entity
          end
        end

        private

        def current_user_params
          params.require(:user).permit(:email)
        end
      end
    end
  end
end
