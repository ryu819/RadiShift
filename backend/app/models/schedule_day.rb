# frozen_string_literal: true

class ScheduleDay < ApplicationRecord
  belongs_to :schedule_month, inverse_of: :schedule_days
  has_many :day_off_slots, dependent: :destroy
  has_many :day_off_requests, dependent: :destroy
  has_many :work_requests, dependent: :destroy
  has_many :work_assignments, dependent: :destroy
  has_many :day_off_assignments, dependent: :destroy
  has_many :modality_assignments, dependent: :destroy
  validates :date, presence: true

  def holiday_name
    return if date.blank?

    HolidayJapan.name(date)
  end

  def weekday_type
    return if date.blank?

    is_holiday ? 7 : date.wday
  end
end
