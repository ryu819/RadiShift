# frozen_string_literal: true

module Api
  module V1
    module Current
      class ShiftsController < ApplicationController
        before_action :authenticate_user!
        before_action :reject_deleted_user!
        before_action :require_facility!

        def show
          schedule_month = current_user.facility.schedule_months.find(
            params[:id]
          )

          schedule_days = schedule_month.schedule_days

          work_assignments =
            if schedule_month.published?
              current_user.work_assignments
                .where(schedule_day: schedule_days)
                .includes(:work_type)
                .order(:schedule_day_id, :created_at, :id)
            else
              []
            end

          day_off_assignments =
            current_user.day_off_assignments
              .where(schedule_day: schedule_days)
              .includes(:day_off_type)
              .order(:schedule_day_id, :created_at, :id)

          day_off_slots =
            day_off_slots_with_remaining_slots(schedule_days)

          render json: {
            work_assignments: work_assignments.as_json(
              only: [:id, :schedule_day_id, :user_id],
              include: {
                work_type: {
                  only: [:id, :name, :color_code]
                }
              }
            ),
            day_off_assignments:
              day_off_assignments.as_json(
                only: [:id, :schedule_day_id, :user_id],
                include: {
                  day_off_type: {
                    only: [:id, :name, :day_off_unit, :color_code, :uses_slot]
                  }
                }
              ),
            day_off_slots: day_off_slots
          }, status: :ok
        end

        private

        def day_off_slots_with_remaining_slots(schedule_days)
          day_off_type_ids =
            current_user.facility
              .day_off_types
              .active
              .where(uses_slot: true)
              .select(:id)

          day_off_slots =
            DayOffSlot
              .where(
                schedule_day: schedule_days,
                day_off_type_id: day_off_type_ids
              )
              .order(:schedule_day_id, :day_off_type_id)

          assigned_counts =
            DayOffAssignment
              .where(
                schedule_day: schedule_days,
                day_off_type_id: day_off_type_ids
              )
              .group(:schedule_day_id, :day_off_type_id)
              .count

          day_off_slots.map do |day_off_slot|
            key = [
              day_off_slot.schedule_day_id,
              day_off_slot.day_off_type_id
            ]

            assigned_count = assigned_counts[key] || 0
            remaining_slots = day_off_slot.max_slots - assigned_count

            {
              id: day_off_slot.id,
              schedule_day_id: day_off_slot.schedule_day_id,
              day_off_type_id: day_off_slot.day_off_type_id,
              max_slots: day_off_slot.max_slots,
              remaining_slots: remaining_slots
            }
          end
        end
      end
    end
  end
end
