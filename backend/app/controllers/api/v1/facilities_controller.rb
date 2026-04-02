# frozen_string_literal: true

module Api
  module V1
    class FacilitiesController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!, only: [:show, :update, :destroy]
      before_action :require_admin!, only: [:update, :destroy]
      before_action :require_no_facility!, only: [:create]

      def show
        render json: facility
      end

      def create
        facility = Facility.new(facility_params)

        Facility.transaction do
          unless facility.save
            return render json: { message: "施設作成に失敗しました。", errors: facility.errors.to_hash(true) },
                          status: :unprocessable_content
          end

          current_user.update!(facility: facility, is_admin: true)
        end

        render json: { message: "新規施設を作成しました。" }, status: :created
      end

      def update
        if facility.update(facility_params)
          render json: { message: "施設情報を更新しました。" }, status: :ok
        else
          render json: { message: "施設の更新に失敗しました。", errors: facility.errors.to_hash(true) }, status: :unprocessable_content
        end
      end

      def destroy
        Facility.transaction do
          facility.users.where(is_admin: true).find_each do |user|
            user.update!(is_admin: false)
          end
        end
        facility.destroy!
        render json: { message: "施設を削除しました。" }, status: :ok
      end

      private

      def facility_params
        params.require(:facility).permit(:name, :request_deadline, :rules_text)
      end

      def facility
        current_user.facility
      end
    end
  end
end
