# frozen_string_literal: true

module Api
  module V1
    class HealthCheckController < ApplicationController
      skip_before_action :authenticate_user!
      skip_before_action :reject_deleted_user!
      skip_before_action :require_facility!

      def index
        render json: { message: "Success Health Check!" }, status: :ok
      end
    end
  end
end
