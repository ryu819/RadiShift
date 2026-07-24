# frozen_string_literal: true

module Api
  module V1
    class ModalityTypesController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_modality_type, only: [:update, :destroy]

      def index
        modality_types = current_user.facility.modality_types.active.order(:id)

        render json: modality_types.as_json(
          only: [:id, :name, :color_code]
        ), status: :ok
      end

      def create
        modality_type = current_user.facility.modality_types.build(modality_type_params)

        if modality_type.save
          render json: { message: "モダリティパターンを作成しました。" }, status: :created
        else
          render json: {
            message: "モダリティパターンの作成に失敗しました。",
            errors: modality_type.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @modality_type.update(modality_type_params)
          render json: { message: "モダリティパターンを更新しました。" }, status: :ok
        else
          render json: {
            message: "モダリティパターンの更新に失敗しました。",
            errors: @modality_type.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @modality_type.update!(is_active: false)

        render json: { message: "モダリティパターンを削除しました。" }, status: :ok
      end

      private

      def set_modality_type
        @modality_type = current_user.facility.modality_types.find(params[:id])
      end

      def modality_type_params
        params.require(:modality_type).permit(:name, :color_code)
      end
    end
  end
end
