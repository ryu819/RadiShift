# frozen_string_literal: true

module Api
  module V1
    module Facilities
      class InvitationsController < ApplicationController
        before_action :authenticate_user!
        before_action :require_facility!, only: [:show, :create, :destroy]
        before_action :require_admin!, only: [:show, :create, :destroy]

        def show
          render json: { invite_code: facility.invite_code,
                         invite_expires_at: facility.invite_expires_at }
        end

        def create
          loop do
            code = SecureRandom.alphanumeric(10)

            begin
              facility.update!(
                invite_code: code,
                invite_expires_at: 1.week.from_now.end_of_day
              )
              break
            rescue ActiveRecord::RecordNotUnique
              next
            end
          end

          render json: { message: "招待コードを作成しました。" }, status: :created
        end

        def destroy
          facility.update!(
            invite_code: nil,
            invite_expires_at: nil
          )
          render json: { message: "招待コードを削除しました。" }, status: :ok
        end

        private

        def facility
          current_user.facility
        end
      end
    end
  end
end
