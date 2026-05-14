# frozen_string_literal: true

module Api
  module V1
    class ScheduleDaysController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!
      before_action :set_schedule_day

      def update
        if @schedule_day.update(schedule_day_params)
          render json: { message: "祝日設定を更新しました。" }, status: :ok
        else
          render json: {
            message: "祝日設定の更新に失敗しました。",
            errors: @schedule_day.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      private

      def set_schedule_day
        @schedule_day = ScheduleDay
                          .joins(:schedule_month)
                          .find_by(
                            id: params[:id],
                            schedule_months: {
                              facility_id: current_user.facility_id
                            }
                          )

        return if @schedule_day

        render json: { message: "対象日が存在しません。" }, status: :not_found
      end

      def schedule_day_params
        params.require(:schedule_day).permit(:is_holiday)
      end
    end
  end
end
