# frozen_string_literal: true

module Api
  module V1
    class MembersController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:update, :destroy, :add_admin, :remove_admin]
      before_action :set_member, only: [:update, :destroy, :add_admin, :remove_admin]

      def index
        members = current_user.facility.users
                    .where(is_deleted: false)
                    .order(:id)

        render json: members.as_json(
          only: [:id, :name, :is_admin, :rules_text]
        ), status: :ok
      end

      def update
        if @member.update(member_params)
          render json: { message: "ユーザー情報を更新しました。" }, status: :ok
        else
          render json: { message: "ユーザー情報の更新に失敗しました。", errors: @member.errors.to_hash(true) }, status: :unprocessable_content
        end
      end

      def destroy
        return render json: { message: "管理者は脱退させられません。先に管理者権限を解除してください。" }, status: :forbidden if @member.is_admin?

        @member.update!(
          facility_id: nil,
          rules_text: nil
        )

        render json: { message: "ユーザーを脱退させました。" }, status: :ok
      end

      def add_admin
        return render json: { message: "対象ユーザーはすでに管理者です。" }, status: :unprocessable_content if @member.is_admin?

        @member.update!(is_admin: true)

        render json: { message: "管理者権限を付与しました。" }, status: :ok
      end

      def remove_admin
        return render json: { message: "自分自身の管理者権限は解除できません。" }, status: :forbidden if @member == current_user
        return render json: { message: "対象ユーザーは管理者ではありません。" }, status: :unprocessable_content unless @member.is_admin?

        @member.update!(is_admin: false)

        render json: { message: "管理者権限を解除しました。" }, status: :ok
      end

      private

      def set_member
        @member = current_user.facility.users
                    .where(is_deleted: false)
                    .find(params[:id])
      end

      def member_params
        params.require(:user).permit(:rules_text)
      end
    end
  end
end
