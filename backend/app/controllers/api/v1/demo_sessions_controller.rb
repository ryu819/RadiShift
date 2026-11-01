# frozen_string_literal: true

module Api
  module V1
    class DemoSessionsController < ApplicationController
      include DeviseHackFakeSession

      RATE_LIMIT_STORE = ActiveSupport::Cache::MemoryStore.new

      rate_limit to: 30,
                 within: 1.hour,
                 by: -> { "all" },
                 store: RATE_LIMIT_STORE

      skip_before_action :authenticate_user!
      skip_before_action :reject_deleted_user!
      skip_before_action :require_facility!

      def create
        admin_user = DemoEnvironment.transaction do
          demo_environment = DemoEnvironment.create!

          result = DemoDataBuilder.call(
            demo_environment: demo_environment
          )

          result[:admin_user]
        end

        sign_in(:user, admin_user, store: false)

        render json: {
          message: "デモを開始しました。"
        }, status: :created
      end
    end
  end
end
