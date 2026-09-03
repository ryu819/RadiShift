# frozen_string_literal: true

module Api
  module V1
    class DayOffRequestsController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:update]
      before_action :set_day_off_request_for_update, only: [:update]
      before_action :set_day_off_request_for_destroy, only: [:destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_day_off_type_for_facility!, only: [:create]
      before_action :validate_return_day_off_assignment!, only: [:create]

      def index
        day_off_requests = current_user.day_off_requests
                             .includes(:schedule_day, :day_off_type)
                             .order(created_at: :asc)

        render json: day_off_requests.as_json(
          {
            only: [:id, :user_id, :schedule_day_id, :day_off_type_id, :request_status, :is_return, :created_at],
            include: {
              schedule_day: {
                only: [:date],
                methods: [
                  :weekday_label
                ]
              },
              day_off_type: {
                only: [:name, :color_code]
              }
            }
          }
        ), status: :ok
      end

      def create
        day_off_request = current_user.day_off_requests.build(day_off_request_params)
        day_off_request.facility = current_user.facility
        day_off_request.request_status = :pending

        unless day_off_request.valid?
          return render json: {
            message: "休み希望の申請に失敗しました。",
            errors: day_off_request.errors.to_hash(true)
          }, status: :unprocessable_content
        end

        DayOffRequest.transaction do
          if day_off_assignment_exists?(day_off_request)
            return render json: {
              message: "すでに休みが割り当てられているため申請できません。"
            }, status: :unprocessable_content
          end

          error_message = day_off_slot_error_message(day_off_request)

          if error_message
            return render json: {
              message: "#{error_message}申請できません。"
            }, status: :unprocessable_content
          end

          day_off_request.save!

          auto_process_day_off_request!(day_off_request) unless over_request_deadline?(day_off_request)
        end

        render json: {
          message: day_off_request_message(day_off_request)
        }, status: :created
      end

      def update
        result = @day_off_request.with_lock do
          process_day_off_request_update!
        end

        render json: { message: result[:message] }, status: result[:status]
      end

      def destroy
        @day_off_request.destroy!

        render json: { message: "休み希望を削除しました。" }, status: :ok
      end

      private

      def set_day_off_request_for_update
        @day_off_request = current_user.facility.day_off_requests.find(params[:id])
      end

      def set_day_off_request_for_destroy
        @day_off_request = current_user.day_off_requests.find(params[:id])
      end

      def day_off_request_params
        params.require(:day_off_request).permit(:schedule_day_id, :day_off_type_id, :is_return)
      end

      def day_off_request_update_params
        params.require(:day_off_request).permit(:request_status)
      end

      def validate_schedule_day_for_facility!
        schedule_day_id = day_off_request_params[:schedule_day_id]

        return if schedule_day_id.blank?
        return if ScheduleDay.joins(:schedule_month).exists?(
          id: schedule_day_id,
          schedule_months: {
            facility_id: current_user.facility_id
          }
        )

        render json: { message: "対象日が存在しません。" }, status: :not_found
      end

      def validate_day_off_type_for_facility!
        day_off_type_id = day_off_request_params[:day_off_type_id]

        return if day_off_type_id.blank?
        return if current_user.facility.day_off_types.exists?(id: day_off_type_id)

        render json: { message: "休みパターンが存在しません。" }, status: :not_found
      end

      def validate_return_day_off_assignment!
        return unless day_off_request_params[:is_return].to_s == "true"

        schedule_day_id = day_off_request_params[:schedule_day_id]
        day_off_type_id = day_off_request_params[:day_off_type_id]

        return if schedule_day_id.blank? || day_off_type_id.blank?

        return if DayOffAssignment.exists?(
          schedule_day_id: schedule_day_id,
          user_id: current_user.id,
          day_off_type_id: day_off_type_id
        )

        render json: { message: "返上対象の休み割当が存在しません。" }, status: :unprocessable_content
      end

      def day_off_slot_error_message(day_off_request)
        return nil if day_off_request.is_return?
        return nil unless day_off_request.day_off_type.uses_slot?

        day_off_slot = DayOffSlot
                         .lock
                         .find_by(
                           schedule_day_id: day_off_request.schedule_day_id,
                           day_off_type_id: day_off_request.day_off_type_id
                         )

        return "休み枠が設定されていないため、" unless day_off_slot

        assigned_count = DayOffAssignment.where(
          schedule_day_id: day_off_request.schedule_day_id,
          day_off_type_id: day_off_request.day_off_type_id
        ).count

        return "休み枠に空きがないため、" if assigned_count >= day_off_slot.max_slots

        nil
      end

      def over_request_deadline?(day_off_request)
        deadline_date = current_user.facility.request_deadline_date_for(
          day_off_request.schedule_day.date
        )

        Date.current > deadline_date
      end

      def auto_process_day_off_request!(day_off_request)
        if day_off_request.is_return?
          return_day_off!(day_off_request, update_status: true)
        else
          assign_day_off!(day_off_request)
        end
      end

      def return_day_off!(day_off_request, update_status:)
        day_off_assignment = find_day_off_assignment(day_off_request)

        unless day_off_assignment
          day_off_request.rejected! if update_status
          return
        end

        day_off_assignment.destroy!
        day_off_request.approved! if update_status
      end

      def assign_day_off!(day_off_request)
        return unless day_off_request.day_off_type.uses_slot?

        create_day_off_assignment!(day_off_request)
        day_off_request.approved!
      end

      def find_day_off_assignment(day_off_request)
        DayOffAssignment
          .lock
          .find_by(
            schedule_day_id: day_off_request.schedule_day_id,
            user_id: day_off_request.user_id,
            day_off_type_id: day_off_request.day_off_type_id
          )
      end

      def day_off_assignment_exists?(day_off_request)
        return false if day_off_request.is_return?

        find_day_off_assignment(day_off_request).present?
      end

      def create_day_off_assignment!(day_off_request)
        DayOffAssignment.create!(
          schedule_day: day_off_request.schedule_day,
          user: day_off_request.user,
          day_off_type: day_off_request.day_off_type
        )
      end

      def day_off_request_message(day_off_request)
        return "申請は承認されました。" if day_off_request.approved?
        return "申請は否認されました。" if day_off_request.rejected?
        return "申請締切日を過ぎているため、承認待ちとして申請されました。" if over_request_deadline?(day_off_request)

        "申請されました。"
      end

      def apply_assignment_for_approved_request!(day_off_request)
        if day_off_request.is_return?
          return_day_off!(day_off_request, update_status: false)
          return
        end

        create_day_off_assignment!(day_off_request)
      end

      def process_day_off_request_update!
        unless @day_off_request.pending?
          return {
            message: "この申請はすでに処理されています。",
            status: :conflict
          }
        end

        approval_error = day_off_request_approval_error
        return approval_error if approval_error

        @day_off_request.update!(day_off_request_update_params)

        apply_assignment_for_approved_request!(@day_off_request) if @day_off_request.approved?

        message = if @day_off_request.approved?
                    "申請を承認し、シフトを変更しました。"
                  else
                    "申請を否認しました。"
                  end

        {
          message: message,
          status: :ok
        }
      end

      def day_off_request_approval_error
        return unless day_off_request_update_params[:request_status] == "approved"

        if day_off_assignment_exists?(@day_off_request)
          return {
            message: "すでに休みが割り当てられているため承認できません。",
            status: :unprocessable_content
          }
        end

        error_message = day_off_slot_error_message(@day_off_request)
        return unless error_message

        {
          message: "#{error_message}承認できません。",
          status: :unprocessable_content
        }
      end
    end
  end
end
