# frozen_string_literal: true

class Facility < ApplicationRecord
  belongs_to :demo_environment, optional: true
  has_many :users, dependent: :nullify
  has_many :schedule_months, dependent: :destroy
  has_many :work_types, dependent: :destroy
  has_many :day_off_types, dependent: :destroy
  has_many :modality_types, dependent: :destroy
  has_many :day_off_slot_rules, dependent: :destroy
  has_many :day_off_requests, dependent: :destroy
  has_many :work_requests, dependent: :destroy
  validates :name, presence: true, uniqueness: true
  validates :request_deadline_day,
            numericality: {
              only_integer: true,
              greater_than_or_equal_to: 1,
              less_than_or_equal_to: 31
            }

  def request_deadline_date_for(target_date)
    previous_month_day = target_date.to_date.prev_month
    previous_month_last_day = previous_month_day.end_of_month.day

    deadline_day = [
      request_deadline_day,
      previous_month_last_day
    ].min

    previous_month_day.change(day: deadline_day)
  end

  def next_request_deadline(date = Date.current)
    target_month = date.to_date.next_month
    deadline_date = request_deadline_date_for(target_month)

    if deadline_date < date.to_date
      target_month = target_month.next_month
      deadline_date = request_deadline_date_for(target_month)
    end

    {
      year: target_month.year,
      month: target_month.month,
      deadline_date: deadline_date,
      days_remaining: (deadline_date - date).to_i
    }
  end

  def active_members_in_display_order
    users
      .where(is_deleted: false)
      .order(:display_order, :id)
  end

  def next_member_display_order
    active_members_in_display_order.maximum(:display_order).to_i + 1
  end
end
