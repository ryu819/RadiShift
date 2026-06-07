# frozen_string_literal: true

module Api
  module V1
    class DayOffAssignmentsController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_day_off_assignment, only: [:update, :destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_user_for_facility!, only: [:create]
      before_action :validate_day_off_type_for_facility!, only: [:create, :update]

      def index
        day_off_assignments = DayOffAssignment
                                .joins(schedule_day: :schedule_month)
                                .where(schedule_months: { facility_id: current_user.facility_id })
                                .includes(:schedule_day, :user, :day_off_type)
                                .order(:schedule_day_id, :user_id)

        render json: {
          day_off_assignments: day_off_assignments.as_json(include: [:schedule_day, :user, :day_off_type])
        }, status: :ok
      end

      def create
        day_off_assignment = DayOffAssignment.new(day_off_assignment_params)

        if day_off_assignment.save
          render json: { message: "休み割当を作成しました。" }, status: :created
        else
          render json: {
            message: "休み割当の作成に失敗しました。",
            errors: day_off_assignment.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @day_off_assignment.update(day_off_assignment_update_params)
          render json: { message: "休み割当を更新しました。" }, status: :ok
        else
          render json: {
            message: "休み割当の更新に失敗しました。",
            errors: @day_off_assignment.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @day_off_assignment.destroy!

        render json: { message: "休み割当を削除しました。" }, status: :ok
      end

      private

      def set_day_off_assignment
        @day_off_assignment = DayOffAssignment
                                .joins(schedule_day: :schedule_month)
                                .find_by!(
                                  id: params[:id],
                                  schedule_months: {
                                    facility_id: current_user.facility_id
                                  }
                                )
      end

      def day_off_assignment_params
        params.require(:day_off_assignment).permit(:schedule_day_id, :user_id, :day_off_type_id)
      end

      def day_off_assignment_update_params
        params.require(:day_off_assignment).permit(:day_off_type_id)
      end

      def validate_schedule_day_for_facility!
        schedule_day_id = day_off_assignment_params[:schedule_day_id]

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
        user_id = day_off_assignment_params[:user_id]

        return if user_id.blank?
        return if User.exists?(id: user_id, facility_id: current_user.facility_id)

        render json: { message: "ユーザーが存在しません。" }, status: :not_found
      end

      def validate_day_off_type_for_facility!
        day_off_type_id = day_off_assignment_params[:day_off_type_id]

        return if day_off_type_id.blank?
        return if current_user.facility.day_off_types.exists?(id: day_off_type_id)

        render json: { message: "休みパターンが存在しません。" }, status: :not_found
      end
    end
  end
end
