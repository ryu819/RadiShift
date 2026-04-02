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
          return render json: { message: "元のメールアドレスと同じです。" }, status: :unprocessable_content if current_user_params[:email] == current_user.email

          if current_user.update(current_user_params)
            if current_user.unconfirmed_email.present?
              render json: { message: "確認メールを送信しました。メールをご確認ください。" }, status: :ok
            else
              render json: { message: "アカウント情報を更新しました。" }, status: :ok
            end
          else
            render json: { message: "アカウントの更新に失敗しました。", errors: current_user.errors.to_hash(true) }, status: :unprocessable_content
          end
        end

        def destroy
          current_user.destroy!
          render json: { message: "アカウントを削除しました。" }, status: :ok
        end

        private

        def current_user_params
          params.require(:user).permit(:email, :name)
        end
      end
    end
  end
end
