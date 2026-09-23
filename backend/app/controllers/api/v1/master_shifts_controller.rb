# frozen_string_literal: true

module Api
  module V1
    class MasterShiftsController < ApplicationController
      def index
        schedule_months = accessible_schedule_months
                            .order(year: :asc, month: :asc)

        render json: schedule_months.as_json(
          only: [:id, :year, :month, :monthly_days_off, :is_published]
        ), status: :ok
      end

      def show
        schedule_month = accessible_schedule_months.find(params[:id])
        schedule_days = schedule_month.schedule_days

        work_assignments = WorkAssignment
                             .where(schedule_day: schedule_days)
                             .includes(:work_type)
                             .order(
                               :user_id,
                               :schedule_day_id,
                               :created_at,
                               :id
                             )

        day_off_assignments = DayOffAssignment
                                .where(schedule_day: schedule_days)
                                .includes(:day_off_type)
                                .order(
                                  :user_id,
                                  :schedule_day_id,
                                  :created_at,
                                  :id
                                )

        modality_assignments = ModalityAssignment
                                 .where(schedule_day: schedule_days)
                                 .includes(:modality_type)
                                 .order(
                                   :user_id,
                                   :schedule_day_id,
                                   :created_at,
                                   :id
                                 )

        members = members_for(
          schedule_month,
          work_assignments,
          day_off_assignments,
          modality_assignments
        )

        render json: {
          members: members.as_json(
            only: [:id, :name, :is_admin]
          ),
          work_assignments_by_user_and_day:
            group_work_assignments_by_user_and_day(work_assignments),
          day_off_assignments_by_user_and_day:
            group_day_off_assignments_by_user_and_day(day_off_assignments),
          modality_assignments_by_user_and_day:
            group_modality_assignments_by_user_and_day(modality_assignments)
        }, status: :ok
      end

      private

      def accessible_schedule_months
        schedule_months = current_user.facility.schedule_months
        return schedule_months if current_user.is_admin?

        schedule_months.where(is_published: true)
      end

      def members_for(schedule_month, work_assignments, day_off_assignments, modality_assignments)
        current_members = current_user.facility.active_members_in_display_order.to_a
        current_member_ids = current_members.map(&:id)

        assignment_user_ids = (
          work_assignments.map(&:user_id) +
          day_off_assignments.map(&:user_id) +
          modality_assignments.map(&:user_id)
        ).uniq

        if schedule_month.member_order_fixed?
          return fixed_order_members(
            schedule_month,
            current_member_ids,
            assignment_user_ids
          )
        end

        return current_members if future_schedule_month?(schedule_month)

        extra_member_ids = assignment_user_ids - current_member_ids
        extra_members = User.where(id: extra_member_ids).order(:id).to_a

        current_members + extra_members
      end

      def fixed_order_members(schedule_month, current_member_ids, assignment_user_ids)
        fixed_member_ids =
          schedule_month
            .schedule_month_member_orders
            .order(:display_order, :id)
            .pluck(:user_id)

        if future_schedule_month?(schedule_month)
          ordered_member_ids =
            fixed_member_ids.select do |member_id|
              current_member_ids.include?(member_id)
            end
        else
          ordered_member_ids =
            fixed_member_ids.select do |member_id|
              current_member_ids.include?(member_id) ||
                assignment_user_ids.include?(member_id)
            end

          extra_member_ids = assignment_user_ids - fixed_member_ids
          ordered_member_ids += extra_member_ids.sort
        end

        members = User.where(id: ordered_member_ids).to_a

        ordered_member_ids.filter_map do |member_id|
          members.find { |member| member.id == member_id }
        end
      end

      def future_schedule_month?(schedule_month)
        schedule_month_date = Date.new(
          schedule_month.year,
          schedule_month.month,
          1
        )

        current_month_date = Date.current.beginning_of_month

        schedule_month_date > current_month_date
      end

      def group_work_assignments_by_user_and_day(work_assignments)
        assignment_fields = [:id, :schedule_day_id, :user_id]
        assignment_fields << :work_request_id if current_user.is_admin?
        work_assignments
          .group_by(&:user_id)
          .transform_values do |user_work_assignments|
            user_work_assignments
              .group_by(&:schedule_day_id)
              .transform_values do |day_work_assignments|
                day_work_assignments.as_json(
                  only: assignment_fields,
                  include: {
                    work_type: {
                      only: [:id, :name, :color_code, :is_requestable]
                    }
                  }
                )
              end
          end
      end

      def group_day_off_assignments_by_user_and_day(day_off_assignments)
        assignment_fields = [:id, :schedule_day_id, :user_id]
        assignment_fields << :day_off_request_id if current_user.is_admin?

        day_off_assignments
          .group_by(&:user_id)
          .transform_values do |user_day_off_assignments|
            user_day_off_assignments
              .group_by(&:schedule_day_id)
              .transform_values do |day_assignments|
                day_assignments.as_json(
                  only: assignment_fields,
                  include: {
                    day_off_type: {
                      only: [
                        :id,
                        :name,
                        :day_off_unit,
                        :color_code,
                        :uses_slot
                      ]
                    }
                  }
                )
              end
          end
      end

      def group_modality_assignments_by_user_and_day(modality_assignments)
        modality_assignments
          .group_by(&:user_id)
          .transform_values do |user_modality_assignments|
            user_modality_assignments
              .group_by(&:schedule_day_id)
              .transform_values do |day_assignments|
                day_assignments.as_json(
                  only: [:id, :schedule_day_id, :user_id],
                  include: {
                    modality_type: {
                      only: [:id, :name, :color_code]
                    }
                  }
                )
              end
          end
      end
    end
  end
end
