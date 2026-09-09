# frozen_string_literal: true

module Api
  module V1
    class WorkRequestsController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:update]
      before_action :set_work_request_for_update, only: [:update]
      before_action :set_work_request_for_destroy, only: [:destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_work_type_for_facility!, only: [:create]

      def index
        schedule_month = current_user.facility.schedule_months.find(
          params[:schedule_month_id]
        )
        work_requests = current_user.work_requests
                          .where(schedule_day: schedule_month.schedule_days)
                          .includes(:schedule_day, :work_type)
                          .order(created_at: :desc)

        render json: work_requests.as_json(
          only: [:id, :user_id, :schedule_day_id, :work_type_id, :request_status, :is_return, :created_at],
          include: {
            schedule_day: {
              only: [:date],
              methods: [
                :weekday_label
              ]
            },
            work_type: {
              only: [:name, :color_code]
            }
          }
        ), status: :ok
      end

      def create
        work_request = build_work_request

        unless work_request.valid?
          return render json: {
            message: "勤務希望の申請に失敗しました。",
            errors: work_request.errors.to_hash(true)
          }, status: :unprocessable_content
        end

        error_message = WorkRequest.transaction do
          create_work_request!(work_request)
        end

        if error_message
          return render json: { message: error_message },
                        status: :unprocessable_content
        end

        render json: {
          message: work_request_message(work_request)
        }, status: :created
      end

      def update
        result = @work_request.with_lock do
          process_work_request_update!
        end

        render json: { message: result[:message] }, status: result[:status]
      end

      def destroy
        @work_request.with_lock do
          unless @work_request.pending?
            return render json: {
              message: "この申請はすでに処理されています。"
            }, status: :conflict
          end

          @work_request.destroy!

          render json: {
            message: "勤務希望を削除しました。"
          }, status: :ok
        end
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

      def build_work_request
        work_request = current_user.work_requests.build(work_request_params)
        work_request.facility = current_user.facility
        work_request.request_status = :pending

        work_request
      end

      def lock_work_type!(work_request)
        work_request.work_type.lock!
      end

      def create_work_request!(work_request)
        lock_work_type!(work_request) unless work_request.is_return?

        error_message =
          work_request_creation_error_message(work_request)

        return error_message if error_message

        work_request.save!

        if work_request.work_type.auto_approve? && !over_request_deadline?(work_request)
          apply_work_assignment!(work_request)
          work_request.approved!
        end

        nil
      end

      def work_request_creation_error_message(work_request)
        inactive_error =
          inactive_work_type_error_message(work_request)

        return inactive_error if inactive_error

        work_assignment_error_message(work_request)
      end

      def inactive_work_type_error_message(work_request)
        return if work_request.is_return?
        return if work_request.work_type.is_active?

        "この勤務パターンは現在利用できません。"
      end

      def work_assignment_error_message(work_request)
        work_assignment = find_work_assignment(work_request)

        if work_request.is_return?
          return "返上対象の勤務割当が存在しません。" unless work_assignment

          return
        end

        return unless work_assignment

        "すでにシフトが割り当てられているため申請できません。"
      end

      def over_request_deadline?(work_request)
        deadline_date = current_user.facility.request_deadline_date_for(
          work_request.schedule_day.date
        )

        Date.current > deadline_date
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

      def return_work_assignment!(work_request)
        work_assignment = find_work_assignment(work_request)
        work_assignment.destroy!
      end

      def create_work_assignment!(work_request)
        WorkAssignment.create!(
          schedule_day: work_request.schedule_day,
          user: work_request.user,
          work_type: work_request.work_type
        )
      end

      def apply_work_assignment!(work_request)
        if work_request.is_return?
          return_work_assignment!(work_request)
        else
          create_work_assignment!(work_request)
        end
      end

      def process_work_request_update!
        unless @work_request.pending?
          return {
            message: "この申請はすでに処理されています。",
            status: :conflict
          }
        end

        if work_request_update_params[:request_status] == "approved"
          lock_work_type!(@work_request) unless @work_request.is_return?

          approval_error = work_request_approval_error
          return approval_error if approval_error
        end

        @work_request.update!(work_request_update_params)

        apply_work_assignment!(@work_request) if @work_request.approved?

        message =
          if @work_request.approved?
            "申請を承認し、シフトを変更しました。"
          else
            "申請を否認しました。"
          end

        {
          message: message,
          status: :ok
        }
      end

      def work_request_approval_error
        if @work_request.is_return?
          unless find_work_assignment(@work_request)
            return {
              message: "返上対象の勤務割当が存在しないため承認できません。",
              status: :unprocessable_content
            }
          end

          return
        end

        unless @work_request.work_type.is_active?
          return {
            message: "この勤務パターンは現在利用できないため承認できません。",
            status: :unprocessable_content
          }
        end

        if find_work_assignment(@work_request)
          return {
            message: "すでにシフトが割り当てられているため承認できません。",
            status: :unprocessable_content
          }
        end

        nil
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
