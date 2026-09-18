# frozen_string_literal: true

module Api
  module V1
    class ModalityAssignmentsController < ApplicationController
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_modality_assignment, only: [:update, :destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_user_for_facility!, only: [:create]
      before_action :validate_modality_type_for_facility!, only: [:create, :update]

      def index
        modality_assignments = ModalityAssignment
                                 .joins(schedule_day: :schedule_month)
                                 .where(schedule_months: { facility_id: current_user.facility_id })
                                 .includes(:schedule_day, :user, :modality_type)
                                 .order(:schedule_day_id, :user_id)

        render json: {
          modality_assignments: modality_assignments.as_json(
            only: [:id, :schedule_day_id, :user_id, :modality_type_id],
            include: {
              schedule_day: {
                only: [:id, :date, :is_holiday]
              },
              user: {
                only: [:id, :name]
              },
              modality_type: {
                only: [:id, :name, :color_code]
              }
            }
          )
        }, status: :ok
      end

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
        return if ScheduleDay.joins(:schedule_month).exists?(
          id: schedule_day_id,
          schedule_months: {
            facility_id: current_user.facility_id
          }
        )

        render json: { message: "対象日が存在しません。" }, status: :not_found
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
        return if current_user.facility.modality_types.exists?(id: modality_type_id)

        render json: { message: "モダリティパターンが存在しません。" }, status: :not_found
      end
    end
  end
end
