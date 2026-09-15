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
            current_user.work_assignments
              .where(schedule_day: schedule_days)
              .includes(:work_type)
              .order(:schedule_day_id, :created_at, :id)

          day_off_assignments =
            current_user.day_off_assignments
              .where(schedule_day: schedule_days)
              .includes(:day_off_type)
              .order(:schedule_day_id, :created_at, :id)

          unless schedule_month.is_published?
            work_assignments =
              work_assignments.where.not(work_request_id: nil)

            day_off_assignments =
              day_off_assignments.where.not(day_off_request_id: nil)
          end

          render json: {
            work_assignments: work_assignments.as_json(
              only: [:id, :schedule_day_id, :user_id, :work_request_id],
              include: {
                work_type: {
                  only: [:id, :name, :color_code, :is_requestable]
                }
              }
            ),
            day_off_assignments:
              day_off_assignments.as_json(
                only: [:id, :schedule_day_id, :user_id, :day_off_request_id],
                include: {
                  day_off_type: {
                    only: [:id, :name, :day_off_unit, :color_code, :uses_slot]
                  }
                }
              )
          }, status: :ok
        end
      end
    end
  end
end
