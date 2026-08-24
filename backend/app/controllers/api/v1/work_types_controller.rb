# frozen_string_literal: true

module Api
  module V1
    class WorkTypesController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_work_type, only: [:update, :destroy]

      def index
        work_types = current_user.facility.work_types.active.order(:id)

        render json: work_types.as_json(
          only: [:id, :name, :color_code, :auto_approve]
        ), status: :ok
      end

      def create
        work_type = current_user.facility.work_types.build(work_type_params)

        if work_type.save
          render json: { message: "勤務タイプを作成しました。" }, status: :created
        else
          render json: {
            message: "勤務タイプの作成に失敗しました。",
            errors: work_type.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @work_type.update(work_type_params)
          render json: { message: "勤務タイプを更新しました。" }, status: :ok
        else
          render json: {
            message: "勤務タイプの更新に失敗しました。",
            errors: @work_type.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @work_type.update!(is_active: false)

        render json: { message: "勤務タイプを削除しました。" }, status: :ok
      end

      private

      def set_work_type
        @work_type = current_user.facility.work_types.find(params[:id])
      end

      def work_type_params
        params.require(:work_type).permit(:name, :color_code, :auto_approve)
      end
    end
  end
end
