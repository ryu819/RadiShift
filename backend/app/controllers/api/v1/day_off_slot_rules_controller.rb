# frozen_string_literal: true

module Api
  module V1
    class DayOffSlotRulesController < ApplicationController
      before_action :require_admin!, only: [:bulk_update]

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

      def bulk_update
        day_off_type = current_user.facility.day_off_types.find_by(id: params[:day_off_type_id])

        return render json: { message: "休みパターンが存在しません。" }, status: :not_found unless day_off_type

        rules_params = params[:day_off_slot_rules]

        return render json: { message: "休み枠ルールの保存に失敗しました。" }, status: :unprocessable_content unless valid_day_off_slot_rules_params?(rules_params)

        day_off_type.with_lock do
          if day_off_type.is_active? && day_off_type.uses_slot?
            save_day_off_slot_rules(day_off_type, rules_params)
          else
            render json: {
              message: "この休みパターンでは休み枠ルールを設定できません。"
            }, status: :unprocessable_content
          end
        end
      end

      private

      def valid_day_off_slot_rules_params?(rules_params)
        return false unless rules_params.is_a?(Array) && rules_params.present?
        return false unless rules_params.all?(ActionController::Parameters)

        weekdays = rules_params.map { |rule_params| rule_params[:weekday] }

        weekdays.all? { |weekday| weekday.is_a?(Integer) && weekday.between?(0, 7) } &&
          weekdays.uniq.size == weekdays.size
      end

      def save_day_off_slot_rules(day_off_type, rules_params)
        day_off_slot_rules = rules_params.map do |rule_params|
          day_off_slot_rule = current_user.facility.day_off_slot_rules.find_or_initialize_by(
            day_off_type: day_off_type,
            weekday: rule_params[:weekday]
          )
          day_off_slot_rule.max_slots = rule_params[:max_slots]
          day_off_slot_rule
        end

        invalid_rules = day_off_slot_rules.reject(&:valid?)

        if invalid_rules.any?
          render json: {
            message: "休み枠ルールの保存に失敗しました。",
            errors: invalid_rules.to_h { |rule| [rule.weekday.to_s, rule.errors.full_messages] }
          }, status: :unprocessable_content
        else
          day_off_slot_rules.each(&:save!)
          render json: { message: "休み枠ルールを保存しました。" }, status: :ok
        end
      end
    end
  end
end
