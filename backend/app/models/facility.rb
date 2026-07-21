# frozen_string_literal: true

class Facility < ApplicationRecord
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
    target_month_first_day = target_date.to_date.beginning_of_month

    previous_month_first_day = target_month_first_day.prev_month

    previous_month_last_day = previous_month_first_day.end_of_month.day

    deadline_day = [
      request_deadline_day,
      previous_month_last_day
    ].min

    previous_month_first_day.change(day: deadline_day)
  end
end
