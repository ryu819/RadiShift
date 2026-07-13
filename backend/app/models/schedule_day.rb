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

  WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"].freeze

  def holiday_name
    HolidayJapan.name(date)
  end

  def day
    date.day
  end

  def weekday_label
    WEEKDAY_LABELS[date.wday]
  end

  def is_sunday
    date.sunday?
  end

  def is_saturday
    date.saturday?
  end
end
