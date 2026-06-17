# frozen_string_literal: true

module Api
  module V1
    class ScheduleMonthsController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_schedule_month, only: [:update, :destroy]

      def index
        schedule_months = current_user.facility.schedule_months
                            .order(year: :asc, month: :asc)

        render json: {
          schedule_months: schedule_months.as_json(
            only: [:id, :year, :month, :monthly_days_off]
          )
        }, status: :ok
      end

      def show
        schedule_month = current_user.facility.schedule_months
                           .includes(schedule_days: { day_off_slots: :day_off_type })
                           .find(params[:id])
        render json: {
          schedule_month: schedule_month.as_json(
            only: [:id, :year, :month, :monthly_days_off],
            include: {
              schedule_days: {
                only: [:id, :date, :is_holiday],
                include: {
                  day_off_slots: {
                    only: [:id, :schedule_day_id, :day_off_type_id, :max_slots],
                    include: {
                      day_off_type: {
                        only: [:id, :name, :color_code]
                      }
                    }
                  }
                }
              }
            }
          )
        }, status: :ok
      end

      def create
        schedule_month = current_user.facility.schedule_months.build(schedule_month_params)

        ScheduleMonth.transaction do
          unless schedule_month.save
            return render json: {
              message: "対象月のシフト作成に失敗しました。",
              errors: schedule_month.errors.to_hash(true)
            }, status: :unprocessable_content
          end
          create_schedule_days_with_day_off_slots!(schedule_month)
        end

        render json: { message: "対象月のシフトを作成しました。" }, status: :created
      end

      def update
        if @schedule_month.update(schedule_month_update_params)
          render json: { message: "対象月のシフトを更新しました。" }, status: :ok
        else
          render json: {
            message: "対象月のシフトの更新に失敗しました。",
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
        @schedule_month = current_user.facility.schedule_months.find(params[:id])
      end

      def schedule_month_params
        params.require(:schedule_month).permit(:year, :month, :monthly_days_off)
      end

      def schedule_month_update_params
        params.require(:schedule_month).permit(:monthly_days_off)
      end

      def create_schedule_days_with_day_off_slots!(schedule_month)
        day_off_slot_rules_by_weekday = current_user.facility.day_off_slot_rules.group_by(&:weekday)

        start_date = Date.new(schedule_month.year, schedule_month.month, 1)
        end_date = start_date.end_of_month

        (start_date..end_date).each do |date|
          is_holiday = HolidayJapan.check(date)

          schedule_day = schedule_month.schedule_days.create!(date: date, is_holiday: is_holiday)

          weekday = is_holiday ? 7 : date.wday
          day_off_slot_rules = day_off_slot_rules_by_weekday[weekday] || []

          day_off_slot_rules.each do |rule|
            schedule_day.day_off_slots.create!(
              day_off_type_id: rule.day_off_type_id,
              max_slots: rule.max_slots
            )
          end
        end
      end
    end
  end
end
