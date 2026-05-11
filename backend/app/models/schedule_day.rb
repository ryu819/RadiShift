# frozen_string_literal: true

class ScheduleDay < ApplicationRecord
  belongs_to :schedule_month

  validates :date, presence: true

  def holiday_name
    return if date.blank?

    HolidayJapan.name(date)
  end

  def public_holiday?
    return false if date.blank?

    HolidayJapan.check(date)
  end

  def weekday_type
    return if date.blank?

    is_holiday ? 7 : date.wday
  end
end
