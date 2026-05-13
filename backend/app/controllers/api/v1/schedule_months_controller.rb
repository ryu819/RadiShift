# frozen_string_literal: true

module Api
  module V1
    class ScheduleMonthsController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_schedule_month, only: [:show, :update, :destroy]

      def index
        schedule_months = current_user.facility.schedule_months
                            .order(year: :asc, month: :asc)

        render json: { schedule_months: schedule_months }
      end

      def show
        render json: { schedule_month: @schedule_month.as_json(include: :schedule_days) }
      end

      def create
        schedule_month = current_user.facility.schedule_months.build(schedule_month_params)

        ScheduleMonth.transaction do
          unless schedule_month.save
            return render json: { message: "対象月のシフト作成に失敗しました。", errors: schedule_month.errors.to_hash(true) },
                          status: :unprocessable_content
          end

          start_date = Date.new(schedule_month.year, schedule_month.month, 1)
          end_date = start_date.end_of_month

          (start_date..end_date).each do |date|
            schedule_month.schedule_days.create!(
              date: date,
              is_holiday: HolidayJapan.check(date)
            )
          end
        end

        render json: { message: "対象月のシフトを作成しました。" }, status: :created
      end

      def update
        if @schedule_month.update(schedule_month_update_params)
          render json: { message: "公休数を更新しました。" }, status: :ok
        else
          render json: {
            message: "公休数の更新に失敗しました。",
            errors: @schedule_month.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @schedule_month.destroy!

        render json: { message: "対象月のシフトを削除しました。" }, status: :ok
      end

      private

      def set_schedule_month
        @schedule_month = current_user.facility.schedule_months
                            .includes(:schedule_days)
                            .find(params[:id])
      end

      def schedule_month_params
        params.require(:schedule_month).permit(:year, :month, :monthly_days_off)
      end

      def schedule_month_update_params
        params.require(:schedule_month).permit(:monthly_days_off)
      end
    end
  end
end
