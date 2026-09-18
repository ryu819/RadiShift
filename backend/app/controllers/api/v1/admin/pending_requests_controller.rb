# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PendingRequestsController < ApplicationController
        before_action :require_admin!

        def index
          work_requests =
            current_user.facility
              .work_requests
              .pending
              .includes(:user, :schedule_day, :work_type)

          day_off_requests =
            current_user.facility
              .day_off_requests
              .pending
              .includes(:user, :schedule_day, :day_off_type)

          serialized_work_requests =
            work_requests.map do |request|
              serialize_work_request(request)
            end

          serialized_day_off_requests =
            day_off_requests.map do |request|
              serialize_day_off_request(request)
            end

          pending_requests =
            (serialized_work_requests + serialized_day_off_requests)
              .sort_by { |request| request[:created_at] }

          render json: pending_requests, status: :ok
        end

        private

        def serialize_work_request(request)
          {
            id: request.id,
            request_kind: "work",
            user_name: request.user.name,
            requested_date: request.schedule_day.date,
            request_weekday_label: request.schedule_day.weekday_label,
            type_name: request.work_type.name,
            color_code: request.work_type.color_code,
            created_at: request.created_at,
            is_return: request.is_return
          }
        end

        def serialize_day_off_request(request)
          {
            id: request.id,
            request_kind: "day_off",
            user_name: request.user.name,
            requested_date: request.schedule_day.date,
            request_weekday_label: request.schedule_day.weekday_label,
            type_name: request.day_off_type.name,
            color_code: request.day_off_type.color_code,
            created_at: request.created_at,
            is_return: request.is_return
          }
        end
      end
    end
  end
end
