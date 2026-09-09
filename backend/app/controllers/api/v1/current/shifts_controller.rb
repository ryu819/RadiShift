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
              )
          }, status: :ok
        end
      end
    end
  end
end
