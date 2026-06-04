# frozen_string_literal: true

module Api
  module V1
    class DayOffSlotsController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_day_off_slot, only: [:update, :destroy]
      before_action :validate_day_off_type_for_facility!, only: [:create]
      before_action :validate_schedule_day_for_facility!, only: [:create]

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

      def destroy
        @day_off_slot.destroy!

        render json: { message: "休み枠を削除しました。" }, status: :ok
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
        return if current_user.facility.day_off_types.exists?(id: day_off_type_id)

        render json: { message: "休みパターンが存在しません。" }, status: :not_found
      end

      def validate_schedule_day_for_facility!
        schedule_day_id = day_off_slot_params[:schedule_day_id]

        return if schedule_day_id.blank?
        return if ScheduleDay.joins(:schedule_month).exists?(
          id: schedule_day_id,
          schedule_months: {
            facility_id: current_user.facility_id
          }
        )

        render json: { message: "対象日が存在しません。" }, status: :not_found
      end
    end
  end
end
