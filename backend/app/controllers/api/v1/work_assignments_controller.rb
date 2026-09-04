# frozen_string_literal: true

module Api
  module V1
    class WorkAssignmentsController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_work_assignment, only: [:update, :destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_user_for_facility!, only: [:create]
      before_action :validate_work_type_for_facility!, only: [:create, :update]

      def create
        work_assignment = WorkAssignment.new(work_assignment_params)

        if work_assignment.save
          render json: { message: "勤務割当を作成しました。" }, status: :created
        else
          render json: {
            message: "勤務割当の作成に失敗しました。",
            errors: work_assignment.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @work_assignment.update(work_assignment_update_params)
          render json: { message: "勤務割当を更新しました。" }, status: :ok
        else
          render json: {
            message: "勤務割当の更新に失敗しました。",
            errors: @work_assignment.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @work_assignment.destroy!

        render json: { message: "勤務割当を削除しました。" }, status: :ok
      end

      private

      def set_work_assignment
        @work_assignment = WorkAssignment
                             .joins(schedule_day: :schedule_month)
                             .find_by!(
                               id: params[:id],
                               schedule_months: {
                                 facility_id: current_user.facility_id
                               }
                             )
      end

      def work_assignment_params
        params.require(:work_assignment).permit(:schedule_day_id, :user_id, :work_type_id)
      end

      def work_assignment_update_params
        params.require(:work_assignment).permit(:work_type_id)
      end

      def validate_schedule_day_for_facility!
        schedule_day_id = work_assignment_params[:schedule_day_id]

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
        user_id = work_assignment_params[:user_id]

        return if user_id.blank?
        return if User.exists?(id: user_id, facility_id: current_user.facility_id)

        render json: { message: "ユーザーが存在しません。" }, status: :not_found
      end

      def validate_work_type_for_facility!
        work_type_id = work_assignment_params[:work_type_id]

        return if work_type_id.blank?
        return if current_user.facility.work_types.exists?(id: work_type_id)

        render json: { message: "勤務パターンが存在しません。" }, status: :not_found
      end
    end
  end
end
