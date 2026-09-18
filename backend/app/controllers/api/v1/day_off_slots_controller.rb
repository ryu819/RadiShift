# frozen_string_literal: true

module Api
  module V1
    class DayOffSlotsController < ApplicationController
      before_action :require_admin!, only: [:create, :update]
      before_action :set_day_off_slot, only: [:update]
      before_action :validate_day_off_type_for_facility!, only: [:create]
      before_action :validate_day_off_type_for_new_slot!, only: [:create]
      before_action :validate_schedule_day_for_facility!, only: [:create]
      before_action :validate_schedule_day_is_future!, only: [:create]

      before_action :validate_existing_day_off_slot_editable!,
                    only: [:update]

      def create
        day_off_slot = DayOffSlot.new(day_off_slot_params)

        if day_off_slot.save
          render json: { message: "休み枠を作成しました。" }, status: :created
        else
          render json: {
            message: "休み枠の作成に失敗しました。",
            errors: day_off_slot.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @day_off_slot.update(day_off_slot_update_params)
          render json: { message: "休み枠を更新しました。" }, status: :ok
        else
          render json: {
            message: "休み枠の更新に失敗しました。",
            errors: @day_off_slot.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      private

      def set_day_off_slot
        @day_off_slot = DayOffSlot
                          .joins(schedule_day: :schedule_month)
                          .find_by!(
                            id: params[:id],
                            schedule_months: {
                              facility_id: current_user.facility_id
                            }
                          )
      end

      def day_off_slot_params
        params.require(:day_off_slot).permit(:schedule_day_id, :day_off_type_id, :max_slots)
      end

      def day_off_slot_update_params
        params.require(:day_off_slot).permit(:max_slots)
      end

      def validate_day_off_type_for_facility!
        day_off_type_id = day_off_slot_params[:day_off_type_id]

        return if day_off_type_id.blank?

        @day_off_type = current_user.facility.day_off_types.find_by(id: day_off_type_id)

        return if @day_off_type

        render json: { message: "休みパターンが存在しません。" }, status: :not_found
      end

      def validate_day_off_type_for_new_slot!
        return unless @day_off_type
        return if @day_off_type.is_active? && @day_off_type.uses_slot?

        render json: {
          message: "この休みパターンでは休み枠を作成できません。"
        }, status: :unprocessable_content
      end

      def validate_schedule_day_for_facility!
        schedule_day_id = day_off_slot_params[:schedule_day_id]

        return if schedule_day_id.blank?

        @schedule_day = ScheduleDay
                          .joins(:schedule_month)
                          .find_by(
                            id: schedule_day_id,
                            schedule_months: {
                              facility_id: current_user.facility_id
                            }
                          )

        return if @schedule_day

        render json: { message: "対象日が存在しません。" }, status: :not_found
      end

      def validate_schedule_day_is_future!
        return unless @schedule_day
        return if @schedule_day.date > Date.current

        render json: {
          message: "今日以前の日付の休み枠は設定できません。"
        }, status: :unprocessable_content
      end

      def validate_existing_day_off_slot_editable!
        unless @day_off_slot.day_off_type.is_active?
          render json: {
            message: "この休みパターンは現在利用できません。"
          }, status: :unprocessable_content

          return
        end

        return if @day_off_slot.schedule_day.date > Date.current

        render json: {
          message: "今日以前の日付の休み枠は変更できません。"
        }, status: :unprocessable_content
      end
    end
  end
end
