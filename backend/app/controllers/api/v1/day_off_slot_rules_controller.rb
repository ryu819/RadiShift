# frozen_string_literal: true

module Api
  module V1
    class DayOffSlotRulesController < ApplicationController
      before_action :authenticate_user!
      before_action :reject_deleted_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update]
      before_action :set_day_off_slot_rule, only: [:update]
      before_action :validate_day_off_type_for_facility!, only: [:create]
      before_action :validate_day_off_type_available_for_slot_rule!, only: [:create]
      before_action :validate_day_off_slot_rule_available!, only: [:update]

      def index
        day_off_slot_rules = current_user.facility.day_off_slot_rules
                               .joins(:day_off_type)
                               .where(day_off_types: {
                                        is_active: true,
                                        uses_slot: true
                                      })
                               .order(:day_off_type_id, :weekday)

        render json: day_off_slot_rules.as_json(
          only: [:id, :day_off_type_id, :weekday, :max_slots]
        ), status: :ok
      end

      def create
        day_off_slot_rule = current_user.facility.day_off_slot_rules.build(day_off_slot_rule_params)

        if day_off_slot_rule.save
          render json: { message: "休み枠ルールを作成しました。" }, status: :created
        else
          render json: {
            message: "休み枠ルールの作成に失敗しました。",
            errors: day_off_slot_rule.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def update
        if @day_off_slot_rule.update(day_off_slot_rule_update_params)
          render json: { message: "休み枠ルールを更新しました。" }, status: :ok
        else
          render json: {
            message: "休み枠ルールの更新に失敗しました。",
            errors: @day_off_slot_rule.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      private

      def set_day_off_slot_rule
        @day_off_slot_rule = current_user.facility.day_off_slot_rules.find(params[:id])
      end

      def day_off_slot_rule_params
        params.require(:day_off_slot_rule).permit(:day_off_type_id, :weekday, :max_slots)
      end

      def day_off_slot_rule_update_params
        params.require(:day_off_slot_rule).permit(:max_slots)
      end

      def validate_day_off_type_for_facility!
        day_off_type_id = day_off_slot_rule_params[:day_off_type_id]

        return if day_off_type_id.blank?

        @day_off_type = current_user.facility.day_off_types.find_by(id: day_off_type_id)
        return if @day_off_type

        render json: { message: "休みパターンが存在しません。" }, status: :not_found
      end

      def validate_day_off_type_available_for_slot_rule!
        return unless @day_off_type
        return if @day_off_type.is_active? && @day_off_type.uses_slot?

        render json: {
          message: "この休みパターンでは休み枠ルールを設定できません。"
        }, status: :unprocessable_content
      end

      def validate_day_off_slot_rule_available!
        day_off_type = @day_off_slot_rule.day_off_type

        return if day_off_type.is_active? && day_off_type.uses_slot?

        render json: {
          message: "この休みパターンでは休み枠ルールを設定できません。"
        }, status: :unprocessable_content
      end
    end
  end
end
