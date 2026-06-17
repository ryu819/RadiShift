# frozen_string_literal: true

module Api
  module V1
    class WorkRequestsController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:update]
      before_action :set_work_request_for_update, only: [:update]
      before_action :set_work_request_for_destroy, only: [:destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_work_type_for_facility!, only: [:create]
      before_action :validate_return_work_assignment!, only: [:create]

      def index
        if current_user.is_admin?
          work_requests = current_user.facility.work_requests
                            .includes(:user, :schedule_day, :work_type)
                            .order(created_at: :asc)

          render json: {
            work_requests: work_requests.as_json(
              only: [:id, :user_id, :schedule_day_id, :work_type_id, :request_status, :is_return, :created_at],
              include: {
                user: {
                  only: [:id, :name]
                },
                schedule_day: {
                  only: [:id, :date, :is_holiday]
                },
                work_type: {
                  only: [:id, :name, :color_code]
                }
              }
            )
          }, status: :ok
        else
          work_requests = current_user.work_requests
                            .includes(:schedule_day, :work_type)
                            .order(created_at: :asc)

          render json: {
            work_requests: work_requests.as_json(
              only: [:id, :user_id, :schedule_day_id, :work_type_id, :request_status, :is_return, :created_at],
              include: {
                schedule_day: {
                  only: [:id, :date, :is_holiday]
                },
                work_type: {
                  only: [:id, :name, :color_code]
                }
              }
            )
          }, status: :ok
        end
      end

      def create
        work_request = current_user.work_requests.build(work_request_params)
        work_request.facility = current_user.facility
        work_request.request_status = :pending

        unless work_request.valid?
          return render json: {
            message: "勤務希望の申請に失敗しました。",
            errors: work_request.errors.to_hash(true)
          }, status: :unprocessable_content
        end

        WorkRequest.transaction do
          work_request.save!
          auto_process_work_request!(work_request) if work_request.work_type.auto_approve? && !over_request_deadline?(work_request)
        end

        render json: {
          message: work_request_message(work_request)
        }, status: :created
      end

      def update
        WorkRequest.transaction do
          @work_request.update!(work_request_update_params)
          apply_assignment_for_approved_request!(@work_request) if @work_request.approved?
        end

        render json: { message: "勤務希望を更新しました。" }, status: :ok
      end

      def destroy
        @work_request.destroy!

        render json: { message: "勤務希望を削除しました。" }, status: :ok
      end

      private

      def set_work_request_for_update
        @work_request = current_user.facility.work_requests.find(params[:id])
      end

      def set_work_request_for_destroy
        @work_request = current_user.work_requests.find(params[:id])
      end

      def work_request_params
        params.require(:work_request).permit(:schedule_day_id, :work_type_id, :is_return)
      end

      def work_request_update_params
        params.require(:work_request).permit(:request_status)
      end

      def validate_schedule_day_for_facility!
        schedule_day_id = work_request_params[:schedule_day_id]

        return if schedule_day_id.blank?
        return if ScheduleDay.joins(:schedule_month).exists?(
          id: schedule_day_id,
          schedule_months: {
            facility_id: current_user.facility_id
          }
        )

        render json: { message: "対象日が存在しません。" }, status: :not_found
      end

      def validate_work_type_for_facility!
        work_type_id = work_request_params[:work_type_id]

        return if work_type_id.blank?
        return if current_user.facility.work_types.exists?(id: work_type_id)

        render json: { message: "勤務パターンが存在しません。" }, status: :not_found
      end

      def validate_return_work_assignment!
        return unless work_request_params[:is_return].to_s == "true"

        schedule_day_id = work_request_params[:schedule_day_id]
        work_type_id = work_request_params[:work_type_id]

        return if schedule_day_id.blank? || work_type_id.blank?

        return if WorkAssignment.exists?(
          schedule_day_id: schedule_day_id,
          user_id: current_user.id,
          work_type_id: work_type_id
        )

        render json: { message: "返上対象の勤務割当が存在しません。" }, status: :unprocessable_content
      end

      def over_request_deadline?(work_request)
        deadline_date = work_request.schedule_day.date - current_user.facility.request_deadline.days

        Date.current > deadline_date
      end

      def auto_process_work_request!(work_request)
        if work_request.is_return?
          return_work!(work_request, update_status: true)
        else
          assign_work!(work_request)
        end
      end

      def return_work!(work_request, update_status:)
        work_assignment = find_work_assignment(work_request)

        unless work_assignment
          work_request.rejected! if update_status
          return
        end

        work_assignment.destroy!
        work_request.approved! if update_status
      end

      def assign_work!(work_request)
        if find_work_assignment(work_request)
          work_request.rejected!
          return
        end

        create_work_assignment!(work_request)
        work_request.approved!
      end

      def find_work_assignment(work_request)
        WorkAssignment
          .lock
          .find_by(
            schedule_day_id: work_request.schedule_day_id,
            user_id: work_request.user_id,
            work_type_id: work_request.work_type_id
          )
      end

      def create_work_assignment!(work_request)
        WorkAssignment.create!(
          schedule_day: work_request.schedule_day,
          user: work_request.user,
          work_type: work_request.work_type
        )
      end

      def apply_assignment_for_approved_request!(work_request)
        if work_request.is_return?
          return_work!(work_request, update_status: false)
          return
        end

        return if find_work_assignment(work_request)

        create_work_assignment!(work_request)
      end

      def work_request_message(work_request)
        return "申請は承認されました。" if work_request.approved?
        return "申請は否認されました。" if work_request.rejected?
        return "申請締切日を過ぎているため、管理者承認待ちとして申請しました。" if over_request_deadline?(work_request)

        "申請しました。"
      end
    end
  end
end
