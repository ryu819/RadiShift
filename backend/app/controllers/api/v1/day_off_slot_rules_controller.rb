# frozen_string_literal: true

module Api
  module V1
    class DayOffSlotRulesController < ApplicationController
      before_action :authenticate_user!
      before_action :require_facility!
      before_action :require_admin!, only: [:create, :update, :destroy]
      before_action :set_day_off_slot_rule, only: [:update, :destroy]

      def index
        day_off_slot_rules = current_user.facility.day_off_slot_rules
                               .order(:day_off_type_id, :weekday)

        render json: { day_off_slot_rules: day_off_slot_rules }, status: :ok
      end

      def create
        return render_day_off_type_not_found unless valid_day_off_type_for_facility?

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
        return render_day_off_type_not_found unless valid_day_off_type_for_facility?

        if @day_off_slot_rule.update(day_off_slot_rule_params)
          render json: { message: "休み枠ルールを更新しました。" }, status: :ok
        else
          render json: {
            message: "休み枠ルールの更新に失敗しました。",
            errors: @day_off_slot_rule.errors.to_hash(true)
          }, status: :unprocessable_content
        end
      end

      def destroy
        @day_off_slot_rule.destroy!

        render json: { message: "休み枠ルールを削除しました。" }, status: :ok
      end

      private

      def set_day_off_slot_rule
        @day_off_slot_rule = current_user.facility.day_off_slot_rules.find(params[:id])
      end

      def day_off_slot_rule_params
        params.require(:day_off_slot_rule).permit(:day_off_type_id, :weekday, :max_slots)
      end

      def valid_day_off_type_for_facility?
        day_off_type_id = day_off_slot_rule_params[:day_off_type_id]

        return false if day_off_type_id.blank?

        current_user.facility.day_off_types.exists?(id: day_off_type_id)
      end

      def render_day_off_type_not_found
        render json: { message: "休みパターンが存在しません。" }, status: :not_found
      end
    end
  end
end
