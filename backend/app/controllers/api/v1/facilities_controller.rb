# frozen_string_literal: true

module Api
  module V1
    class FacilitiesController < ApplicationController
      skip_before_action :require_facility!, only: [:create, :join]
      before_action :require_no_facility!, only: [:create, :join]
      before_action :require_admin!, only: [:update, :destroy]

      def show
        render json: current_facility.as_json(
          only: [:id, :name, :request_deadline_day, :rules_text],
          methods: [:next_request_deadline]
        ), status: :ok
      end

      def create
        facility = Facility.new(facility_params.merge(
                                  demo_environment: current_user.demo_environment
                                ))

        current_user.with_lock do
          if current_user.facility.present?
            return render json: { message: "すでに施設に所属しています。" },
                          status: :conflict
          end

          unless facility.save
            return render json: { message: "施設作成に失敗しました。", errors: facility.errors.to_hash(true) },
                          status: :unprocessable_content
          end

          current_user.update!(facility: facility, is_admin: true, display_order: 1)
        end

        render json: { message: "新規施設を作成しました。" }, status: :created
      end

      def update
        if current_facility.update(facility_params)
          render json: { message: "施設情報を更新しました。" }, status: :ok
        else
          render json: { message: "施設の更新に失敗しました。", errors: current_facility.errors.to_hash(true) }, status: :unprocessable_content
        end
      end

      def destroy
        current_facility.with_lock do
          current_facility.users.find_each do |user|
            user.update!(
              facility: nil,
              display_order: nil,
              is_admin: false
            )
          end

          current_facility.destroy!
        end

        render json: { message: "施設を削除しました。" }, status: :ok
      end

      def join
        code = params[:invite_code]

        return render json: { message: "招待コードが必要です。" }, status: :bad_request if code.blank?

        facility = Facility.find_by(invite_code: code)

        return render json: { message: "施設が存在しません。" }, status: :not_found if facility.nil?

        return render json: { message: "招待コードの有効期限が切れています。" }, status: :gone if facility.invite_expires_at.past?

        unless same_demo_environment?(facility)
          return render json: {
            message: "この施設には参加できません。"
          }, status: :forbidden
        end

        facility.with_lock do
          current_user.with_lock do
            if current_user.facility.present?
              return render json: { message: "すでに施設に所属しています。" },
                            status: :conflict
            end

            current_user.update!(
              facility: facility,
              is_admin: false,
              display_order: facility.next_member_display_order
            )

            fixed_schedule_months_from_current_month(facility).find_each do |schedule_month|
              schedule_month.append_member_to_fixed_order!(current_user)
            end
          end
        end
        render json: { message: "施設に参加しました。" }, status: :ok
      end

      def leave
        return render json: { message: "管理者は脱退できません。（管理者権限の移譲が必要です。）" }, status: :forbidden if current_user.is_admin?

        current_facility.with_lock do
          current_user.with_lock do
            current_user.cleanup_shift_data_for_facility_departure!

            current_user.update!(
              facility: nil,
              display_order: nil
            )
          end
        end

        render json: { message: "施設を脱退しました。" }, status: :ok
      end

      private

      def facility_params
        params.require(:facility).permit(:name, :request_deadline_day, :rules_text)
      end

      def current_facility
        current_user.facility
      end

      def fixed_schedule_months_from_current_month(facility)
        current_month = Date.current.beginning_of_month

        facility.schedule_months
          .where(
            "year > :year OR (year = :year AND month >= :month)",
            year: current_month.year,
            month: current_month.month
          )
          .joins(:schedule_month_member_orders)
          .distinct
      end

      def same_demo_environment?(facility)
        current_user.demo_environment_id ==
          facility.demo_environment_id
      end
    end
  end
end
