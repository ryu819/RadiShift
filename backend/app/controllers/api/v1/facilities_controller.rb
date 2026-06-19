# frozen_string_literal: true

module Api
  module V1
    class FacilitiesController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!, only: [:show, :update, :destroy, :leave]
      before_action :require_admin!, only: [:update, :destroy]
      before_action :require_no_facility!, only: [:create, :join]

      def show
        render json: current_facility.as_json(
          only: [:id, :name, :request_deadline, :rules_text]
        ), status: :ok
      end

      def create
        facility = Facility.new(facility_params)

        Facility.transaction do
          unless facility.save
            return render json: { message: "施設作成に失敗しました。", errors: facility.errors.to_hash(true) },
                          status: :unprocessable_content
          end

          current_user.update!(facility: facility, is_admin: true)
        end

        render json: { message: "新規施設を作成しました。" }, status: :created
      end

      def update
        if current_facility.update(facility_params)
          render json: { message: "施設情報を更新しました。" }, status: :ok
        else
          render json: { message: "施設の更新に失敗しました。", errors: current_facility.errors.to_hash(true) }, status: :unprocessable_content
        end
      end

      def destroy
        Facility.transaction do
          current_facility.users.where(is_admin: true).find_each do |user|
            user.update!(is_admin: false)
          end
        end
        current_facility.destroy!
        render json: { message: "施設を削除しました。" }, status: :ok
      end

      def join
        code = params[:invite_code]

        return render json: { message: "招待コードが必要です。" }, status: :bad_request if code.blank?

        facility = Facility.find_by(invite_code: code)

        return render json: { message: "施設が存在しません。" }, status: :not_found if facility.nil?

        return render json: { message: "招待コードの有効期限が切れています。" }, status: :gone if facility.invite_expires_at.past?

        current_user.update!(facility: facility)

        render json: { message: "施設に参加しました。" }, status: :ok
      end

      def leave
        return render json: { message: "管理者は脱退できません。（管理者権限の移譲が必要です。）" }, status: :forbidden if current_user.is_admin?

        current_user.update!(facility: nil)

        render json: { message: "施設を脱退しました。" }, status: :ok
      end

      private

      def facility_params
        params.require(:facility).permit(:name, :request_deadline, :rules_text)
      end

      def current_facility
        current_user.facility
      end
    end
  end
end
