# frozen_string_literal: true

module Api
  module V1
    module Admin
      class MasterShiftsController < ApplicationController
        before_action :authenticate_user!
        before_action :reject_deleted_user!
        before_action :require_facility!
        before_action :require_admin!

        def show
          schedule_month = current_user.facility.schedule_months.find(
            params[:id]
          )

          schedule_days = schedule_month.schedule_days

          work_assignments = WorkAssignment
                               .where(schedule_day: schedule_days)
                               .includes(:work_type)
                               .order(
                                 :user_id,
                                 :schedule_day_id,
                                 :created_at,
                                 :id
                               )

          day_off_assignments = DayOffAssignment
                                  .where(schedule_day: schedule_days)
                                  .includes(:day_off_type)
                                  .order(
                                    :user_id,
                                    :schedule_day_id,
                                    :created_at,
                                    :id
                                  )

          render json: {
            work_assignments_by_user_and_day:
              group_work_assignments_by_user_and_day(work_assignments),
            day_off_assignments_by_user_and_day:
              group_day_off_assignments_by_user_and_day(day_off_assignments)
          }, status: :ok
        end

        private

        def group_work_assignments_by_user_and_day(work_assignments)
          work_assignments
            .group_by(&:user_id)
            .transform_values do |user_work_assignments|
              user_work_assignments
                .group_by(&:schedule_day_id)
                .transform_values do |day_work_assignments|
                  day_work_assignments.as_json(
                    only: [:id, :schedule_day_id, :user_id, :work_request_id],
                    include: {
                      work_type: {
                        only: [:id, :name, :color_code, :is_requestable]
                      }
                    }
                  )
                end
            end
        end

        def group_day_off_assignments_by_user_and_day(day_off_assignments)
          day_off_assignments
            .group_by(&:user_id)
            .transform_values do |user_day_off_assignments|
              user_day_off_assignments
                .group_by(&:schedule_day_id)
                .transform_values do |day_assignments|
                  day_assignments.as_json(
                    only: [:id, :schedule_day_id, :user_id, :day_off_request_id],
                    include: {
                      day_off_type: {
                        only: [
                          :id,
                          :name,
                          :day_off_unit,
                          :color_code,
                          :uses_slot
                        ]
                      }
                    }
                  )
                end
            end
        end
      end
    end
  end
end
