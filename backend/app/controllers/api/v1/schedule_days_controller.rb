# frozen_string_literal: true

module Api
  module V1
    class ScheduleDaysController < ApplicationController
      before_action :require_admin!
      before_action :set_schedule_day

      def update
        if @schedule_day.update(schedule_day_params)
          render json: { message: "対象日を更新しました。" }, status: :ok
        else
          render json: {
            message: "対象日の更新に失敗しました。",
            errors: @schedule_day.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      private

      def set_schedule_day
        @schedule_day = ScheduleDay.joins(:schedule_month)
                          .find_by!(id: params[:id],
                                    schedule_months: { facility_id: current_user.facility_id })
      end

      def schedule_day_params
        params.require(:schedule_day).permit(:is_holiday)
      end
    end
  end
end
