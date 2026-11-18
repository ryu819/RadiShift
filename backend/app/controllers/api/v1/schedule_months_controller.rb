# frozen_string_literal: true

module Api
  module V1
    class ScheduleMonthsController < ApplicationController
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_schedule_month, only: [:update, :destroy]

      def index
        schedule_months = current_user.facility.schedule_months
                            .order(year: :asc, month: :asc)

        render json: schedule_months.as_json(
          only: [:id, :year, :month, :monthly_days_off, :is_published]
        ), status: :ok
      end

      def show
        schedule_month = current_user.facility.schedule_months
                           .includes(schedule_days: { day_off_slots: :day_off_type })
                           .find(params[:id])

        schedule_days = schedule_month.schedule_days

        assigned_counts =
          DayOffAssignment
            .where(schedule_day: schedule_days)
            .group(:schedule_day_id, :day_off_type_id)
            .count

        schedule_month_json = schedule_month.as_json(
          only: [:id, :year, :month, :monthly_days_off, :is_published],
          include: {
            schedule_days: {
              only: [:id, :date, :is_holiday],
              methods: [
                :day,
                :weekday_label,
                :is_sunday,
                :is_saturday
              ],
              include: {
                day_off_slots: {
                  only: [
                    :id,
                    :schedule_day_id,
                    :day_off_type_id,
                    :max_slots
                  ],
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

        add_remaining_slots(schedule_month_json, assigned_counts)

        render json: schedule_month_json, status: :ok
      end

      def create
        schedule_month = current_user.facility.schedule_months.build(schedule_month_params)

        next_day_error = nil

        ScheduleMonth.transaction do
          unless schedule_month.save
            return render json: {
              message: "対象月のシフト作成に失敗しました。",
              errors: schedule_month.errors.to_hash(true)
            }, status: :unprocessable_content
          end
          create_schedule_days_with_day_off_slots!(schedule_month)
          next_day_error = complete_previous_month_assignments(schedule_month)
          raise ActiveRecord::Rollback if next_day_error
        end

        return render json: { message: next_day_error }, status: :unprocessable_content if next_day_error

        render json: { message: "対象月のシフトを作成しました。" }, status: :created
      end

      def update
        current_user.facility.with_lock do
          unless @schedule_month.update(schedule_month_update_params)
            return render json: {
              message: "対象月のシフトの更新に失敗しました。",
              errors: @schedule_month.errors.to_hash(true)
            }, status: :unprocessable_content
          end

          @schedule_month.capture_member_order! if @schedule_month.is_published?
        end

        render json: {
          message: "対象月のシフトを更新しました。"
        }, status: :ok
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
        params.require(:schedule_month).permit(:monthly_days_off, :is_published)
      end

      def add_remaining_slots(schedule_month_json, assigned_counts)
        schedule_month_json["schedule_days"].each do |schedule_day|
          schedule_day["day_off_slots"].each do |day_off_slot|
            key = [
              day_off_slot["schedule_day_id"],
              day_off_slot["day_off_type_id"]
            ]

            assigned_count = assigned_counts[key] || 0

            day_off_slot["remaining_slots"] =
              day_off_slot["max_slots"] - assigned_count
          end
        end
      end

      def complete_previous_month_assignments(schedule_month)
        month_start = Date.new(schedule_month.year, schedule_month.month, 1)
        assignments = WorkAssignment.joins(schedule_day: :schedule_month)
                        .where(schedule_days: { date: month_start - 1.day },
                               schedule_months: { facility_id: current_user.facility_id },
                               primary_work_assignment_id: nil)
                        .includes(:schedule_day, :user, work_type: :next_day_work_type)
        if month_start > Date.current.beginning_of_month
          assignments = assignments.joins(:user).where(users: { facility_id: current_user.facility_id, is_deleted: false })
        end
        assignments.find_each do |assignment|
          error = assignment.next_day_error_message
          return error if error

          assignment.create_next_day_work_assignment!
        end
        nil
      end

      def create_schedule_days_with_day_off_slots!(schedule_month)
        day_off_slot_rules_by_weekday = current_user.facility.day_off_slot_rules
                                          .joins(:day_off_type)
                                          .where(
                                            day_off_types: {
                                              is_active: true,
                                              uses_slot: true
                                            }
                                          ).group_by(&:weekday)

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
