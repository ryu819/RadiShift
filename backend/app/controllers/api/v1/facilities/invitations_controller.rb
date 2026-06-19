# frozen_string_literal: true

module Api
  module V1
    module Facilities
      class InvitationsController < ApplicationController
        INVITE_CODE_LENGTH = 10
        INVITE_EXPIRATION = 1.week

        before_action :authenticate_user!
        before_action :reject_deleted_user!
        before_action :require_facility!, only: [:show, :create, :destroy]
        before_action :require_admin!, only: [:show, :create, :destroy]

        def show
          render json: { invite_code: facility.invite_code,
                         invite_expires_at: facility.invite_expires_at }
        end

        def create
          loop do
            code = SecureRandom.alphanumeric(INVITE_CODE_LENGTH)

            begin
              facility.update!(
                invite_code: code,
                invite_expires_at: INVITE_EXPIRATION.from_now.end_of_day
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
