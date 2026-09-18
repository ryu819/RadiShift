# frozen_string_literal: true

module Api
  module V1
    class DayOffRequestsController < ApplicationController
      before_action :require_admin!, only: [:update]
      before_action :set_day_off_request_for_update, only: [:update]
      before_action :set_day_off_request_for_destroy, only: [:destroy]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_day_off_type_for_facility!, only: [:create]

      def index
        schedule_month = current_user.facility.schedule_months.find(
          params[:schedule_month_id]
        )
        day_off_requests = current_user.day_off_requests
                             .where(schedule_day: schedule_month.schedule_days)
                             .includes(:schedule_day, :day_off_type)
                             .order(created_at: :desc)

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
        day_off_request = build_day_off_request

        unless day_off_request.valid?
          return render json: {
            message: "休み希望の申請に失敗しました。",
            errors: day_off_request.errors.to_hash(true)
          }, status: :unprocessable_content
        end

        error_message = DayOffRequest.transaction do
          create_day_off_request!(day_off_request)
        end

        if error_message
          return render json: { message: error_message },
                        status: :unprocessable_content
        end

        render json: {
          message: day_off_request_message(day_off_request)
        }, status: :created
      end

      def update
        @day_off_request.with_lock do
          unless @day_off_request.pending?
            return render json: {
              message: "この申請はすでに処理されています。"
            }, status: :conflict
          end

          if day_off_request_update_params[:request_status] == "approved"
            lock_day_off_type!(@day_off_request) unless @day_off_request.is_return?

            error_message = day_off_request_approval_error_message

            if error_message
              return render json: {
                message: error_message
              }, status: :unprocessable_content
            end
          end

          @day_off_request.update!(day_off_request_update_params)

          apply_day_off_assignment!(@day_off_request) if @day_off_request.approved?

          message =
            if @day_off_request.approved?
              "申請を承認し、シフトを変更しました。"
            else
              "申請を否認しました。"
            end

          render json: {
            message: message
          }, status: :ok
        end
      end

      def destroy
        @day_off_request.with_lock do
          unless @day_off_request.pending?
            return render json: {
              message: "この申請はすでに処理されています。"
            }, status: :conflict
          end

          @day_off_request.destroy!

          render json: {
            message: "休み希望を削除しました。"
          }, status: :ok
        end
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

      def build_day_off_request
        day_off_request = current_user.day_off_requests.build(day_off_request_params)
        day_off_request.facility = current_user.facility
        day_off_request.request_status = :pending

        day_off_request
      end

      def lock_day_off_type!(day_off_request)
        day_off_request.day_off_type.lock!
      end

      def create_day_off_request!(day_off_request)
        date_error =
          day_off_request_date_error_message(day_off_request)

        return date_error if date_error

        lock_day_off_type!(day_off_request) unless day_off_request.is_return?

        error_message =
          day_off_request_creation_error_message(day_off_request)

        return error_message if error_message

        day_off_request.save!

        if day_off_slot_exists?(day_off_request) && !over_request_deadline?(day_off_request)
          apply_day_off_assignment!(day_off_request)
          day_off_request.approved!
        end

        nil
      end

      def day_off_request_date_error_message(day_off_request)
        return if day_off_request.schedule_day.date > Date.current

        "今日以前の日付には申請できません。"
      end

      def day_off_request_creation_error_message(day_off_request)
        inactive_error =
          inactive_day_off_type_error_message(day_off_request)

        return inactive_error if inactive_error

        assignment_error =
          day_off_assignment_error_message(day_off_request)

        return assignment_error if assignment_error

        slot_error = day_off_slot_error_message(day_off_request)
        return unless slot_error

        "#{slot_error}申請できません。"
      end

      def inactive_day_off_type_error_message(day_off_request)
        return if day_off_request.is_return?
        return if day_off_request.day_off_type.is_active?

        "この休みパターンは現在利用できません。"
      end

      def day_off_assignment_error_message(day_off_request)
        day_off_assignment = find_day_off_assignment(day_off_request)

        if day_off_request.is_return?
          return "返上対象の休み割当が存在しません。" unless day_off_assignment

          return "管理者が設定した休み割当は返上できません。" unless day_off_assignment.created_from_request?

          return
        end

        return unless day_off_assignment

        "すでに休みが割り当てられているため申請できません。"
      end

      def day_off_slot_error_message(day_off_request)
        return nil if day_off_request.is_return?

        day_off_slot = find_day_off_slot(day_off_request)

        unless day_off_slot
          return "休み枠が設定されていないため、" if day_off_request.day_off_type.uses_slot?

          return nil
        end

        assigned_count =
          DayOffAssignment.where(
            schedule_day_id: day_off_request.schedule_day_id,
            day_off_type_id: day_off_request.day_off_type_id
          ).count

        return "休み枠に空きがないため、" if assigned_count >= day_off_slot.max_slots

        nil
      end

      def find_day_off_slot(day_off_request)
        DayOffSlot
          .lock
          .find_by(
            schedule_day_id: day_off_request.schedule_day_id,
            day_off_type_id: day_off_request.day_off_type_id
          )
      end

      def day_off_slot_exists?(day_off_request)
        DayOffSlot.exists?(
          schedule_day_id: day_off_request.schedule_day_id,
          day_off_type_id: day_off_request.day_off_type_id
        )
      end

      def over_request_deadline?(day_off_request)
        deadline_date = current_user.facility.request_deadline_date_for(
          day_off_request.schedule_day.date
        )

        Date.current > deadline_date
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

      def return_day_off_assignment!(day_off_request)
        day_off_assignment = find_day_off_assignment(day_off_request)
        day_off_assignment.destroy!
      end

      def create_day_off_assignment!(day_off_request)
        DayOffAssignment.create!(
          schedule_day: day_off_request.schedule_day,
          user: day_off_request.user,
          day_off_type: day_off_request.day_off_type,
          day_off_request: day_off_request
        )
      end

      def apply_day_off_assignment!(day_off_request)
        if day_off_request.is_return?
          return_day_off_assignment!(day_off_request)
        else
          create_day_off_assignment!(day_off_request)
        end
      end

      def day_off_request_message(day_off_request)
        return "申請は承認されました。" if day_off_request.approved?
        return "申請は否認されました。" if day_off_request.rejected?
        return "申請締切日を過ぎているため、承認待ちとして申請されました。" if over_request_deadline?(day_off_request)

        "申請しました。"
      end

      def day_off_request_approval_error_message
        return "今日以前の日付の申請は承認できません。" if @day_off_request.schedule_day.date <= Date.current

        if @day_off_request.is_return?
          day_off_assignment = find_day_off_assignment(@day_off_request)

          return "返上対象の休み割当が存在しないため承認できません。" unless day_off_assignment

          return "管理者が設定した休み割当は返上できないため承認できません。" unless day_off_assignment.created_from_request?

          return
        end

        return "この休みパターンは現在利用できないため承認できません。" unless @day_off_request.day_off_type.is_active?

        return "すでに休みが割り当てられているため承認できません。" if find_day_off_assignment(@day_off_request)

        error_message = day_off_slot_error_message(@day_off_request)

        return unless error_message

        "#{error_message}承認できません。"
      end
    end
  end
end
