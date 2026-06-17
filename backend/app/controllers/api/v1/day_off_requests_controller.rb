# frozen_string_literal: true

module Api
  module V1
    class DayOffRequestsController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:update]
      before_action :set_day_off_request_for_update, only: [:update]
      before_action :set_day_off_request_for_destroy, only: [:destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_day_off_type_for_facility!, only: [:create]
      before_action :validate_return_day_off_assignment!, only: [:create]

      def index
        if current_user.is_admin?
          day_off_requests = current_user.facility.day_off_requests
                               .includes(:user, :schedule_day, :day_off_type)
                               .order(created_at: :asc)

          render json: {
            day_off_requests: day_off_requests.as_json(
              {
                only: [:id, :user_id, :schedule_day_id, :day_off_type_id, :request_status, :is_return, :created_at],
                include: {
                  user: {
                    only: [:id, :name]
                  },
                  schedule_day: {
                    only: [:id, :date, :is_holiday]
                  },
                  day_off_type: {
                    only: [:id, :name, :color_code]
                  }
                }
              }
            )
          }, status: :ok
        else
          day_off_requests = current_user.day_off_requests
                               .includes(:schedule_day, :day_off_type)
                               .order(created_at: :asc)

          render json: {
            day_off_requests: day_off_requests.as_json(
              {
                only: [:id, :user_id, :schedule_day_id, :day_off_type_id, :request_status, :is_return, :created_at],
                include: {
                  schedule_day: {
                    only: [:id, :date, :is_holiday]
                  },
                  day_off_type: {
                    only: [:id, :name, :color_code]
                  }
                }
              }
            )
          }, status: :ok
        end
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
          day_off_request.save!
          auto_process_day_off_request!(day_off_request) unless over_request_deadline?(day_off_request)
        end

        render json: {
          message: day_off_request_message(day_off_request)
        }, status: :created
      end

      def update
        DayOffRequest.transaction do
          @day_off_request.update!(day_off_request_update_params)
          apply_assignment_for_approved_request!(@day_off_request) if @day_off_request.approved?
        end

        render json: { message: "休み希望を更新しました。" }, status: :ok
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

      def over_request_deadline?(day_off_request)
        deadline_date = day_off_request.schedule_day.date - current_user.facility.request_deadline.days

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
        if find_day_off_assignment(day_off_request)
          day_off_request.rejected!
          return
        end

        unless day_off_request.day_off_type.uses_slot?
          create_day_off_assignment!(day_off_request)
          day_off_request.approved!
          return
        end

        day_off_slot = DayOffSlot
                         .lock
                         .find_by(
                           schedule_day_id: day_off_request.schedule_day_id,
                           day_off_type_id: day_off_request.day_off_type_id
                         )

        unless day_off_slot
          day_off_request.pending!
          return
        end

        assigned_count = DayOffAssignment.where(
          schedule_day_id: day_off_request.schedule_day_id,
          day_off_type_id: day_off_request.day_off_type_id
        ).count

        if assigned_count >= day_off_slot.max_slots
          day_off_request.rejected!
          return
        end

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

      def create_day_off_assignment!(day_off_request)
        DayOffAssignment.create!(
          schedule_day: day_off_request.schedule_day,
          user: day_off_request.user,
          day_off_type: day_off_request.day_off_type
        )
      end

      def apply_assignment_for_approved_request!(day_off_request)
        if day_off_request.is_return?
          return_day_off!(day_off_request, update_status: false)
          return
        end

        return if find_day_off_assignment(day_off_request)

        create_day_off_assignment!(day_off_request)
      end

      def day_off_request_message(day_off_request)
        return "申請は承認されました。" if day_off_request.approved?
        return "申請は否認されました。" if day_off_request.rejected?
        return "申請締切日を過ぎているため、管理者承認待ちとして申請しました。" if over_request_deadline?(day_off_request)

        "申請しました。"
      end
    end
  end
end
