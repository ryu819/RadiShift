# frozen_string_literal: true

module Api
  module V1
    class ModalityAssignmentsController < ApplicationController
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_modality_assignment, only: [:update, :destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_not_past_schedule_day!, only: [:create, :update, :destroy]
      before_action :validate_user_for_facility!, only: [:create]
      before_action :validate_modality_type_for_facility!, only: [:create, :update]

      def create
        modality_assignment = ModalityAssignment.new(modality_assignment_params)

        if modality_assignment.save
          render json: { message: "モダリティ割当を作成しました。" }, status: :created
        else
          render json: {
            message: "モダリティ割当の作成に失敗しました。",
            errors: modality_assignment.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @modality_assignment.update(modality_assignment_update_params)
          render json: { message: "モダリティ割当を更新しました。" }, status: :ok
        else
          render json: {
            message: "モダリティ割当の更新に失敗しました。",
            errors: @modality_assignment.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @modality_assignment.destroy!

        render json: { message: "モダリティ割当を削除しました。" }, status: :ok
      end

      private

      def set_modality_assignment
        @modality_assignment = ModalityAssignment
                                 .joins(schedule_day: :schedule_month)
                                 .find_by!(
                                   id: params[:id],
                                   schedule_months: {
                                     facility_id: current_user.facility_id
                                   }
                                 )
      end

      def modality_assignment_params
        params.require(:modality_assignment).permit(:schedule_day_id, :user_id, :modality_type_id)
      end

      def modality_assignment_update_params
        params.require(:modality_assignment).permit(:modality_type_id)
      end

      def validate_schedule_day_for_facility!
        schedule_day_id = modality_assignment_params[:schedule_day_id]

        return if schedule_day_id.blank?

        @schedule_day = ScheduleDay
                          .joins(:schedule_month)
                          .find_by(
                            id: schedule_day_id,
                            schedule_months: {
                              facility_id: current_user.facility_id
                            }
                          )

        return if @schedule_day.present?

        render json: { message: "対象日が存在しません。" }, status: :not_found
      end

      def validate_not_past_schedule_day!
        schedule_day = @schedule_day || @modality_assignment&.schedule_day

        return if schedule_day.blank? || schedule_day.date >= Date.current

        render json: { message: "過去日のシフトは変更できません。" }, status: :unprocessable_content
      end

      def validate_user_for_facility!
        user_id = modality_assignment_params[:user_id]

        return if user_id.blank?
        return if User.exists?(id: user_id, facility_id: current_user.facility_id)

        render json: { message: "ユーザーが存在しません。" }, status: :not_found
      end

      def validate_modality_type_for_facility!
        modality_type_id = modality_assignment_params[:modality_type_id]

        return if modality_type_id.blank?
        return if current_user.facility.modality_types.active.exists?(id: modality_type_id)

        render json: { message: "モダリティが存在しません。" }, status: :not_found
      end
    end
  end
end
