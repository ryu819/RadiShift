# frozen_string_literal: true

module Api
  module V1
    class DayOffTypesController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_day_off_type, only: [:update, :destroy]

      def index
        day_off_types = current_user.facility.day_off_types.active.order(:id)

        render json: day_off_types.as_json(
          only: [:id, :name, :day_off_unit, :color_code, :uses_slot]
        ), status: :ok
      end

      def create
        day_off_type = current_user.facility.day_off_types.build(day_off_type_params)

        if day_off_type.save
          render json: { message: "休みタイプを作成しました。" }, status: :created
        else
          render json: {
            message: "休みタイプの作成に失敗しました。",
            errors: day_off_type.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @day_off_type.update(day_off_type_params)
          render json: { message: "休みタイプを更新しました。" }, status: :ok
        else
          render json: {
            message: "休みタイプの更新に失敗しました。",
            errors: @day_off_type.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @day_off_type.update!(is_active: false)

        render json: { message: "休みタイプを削除しました。" }, status: :ok
      end

      private

      def set_day_off_type
        @day_off_type = current_user.facility.day_off_types.find(params[:id])
      end

      def day_off_type_params
        params.require(:day_off_type).permit(:name, :day_off_unit, :color_code, :uses_slot)
      end
    end
  end
end
